"use client";

import React, { useState, Fragment } from "react";
import styles from "./EventList.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog, Transition } from "@headlessui/react";
import "@/utils/types";

export interface EventRow {
  id: number;
  description: string;
  bestTime?: string;
  isRecurring?: boolean;
  maxHours?: number;
  dueDate?: string;
}

interface Session {
  provider_token: string;
  provider_refresh_token: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: any;
}

interface EventListProps {
  onAddToCalendar: (
    event: EventRow,
    times: string[],
    descriptions: string[],
  ) => void;
  onAddToLocalCalendar: (
    event: EventRow,
    times: string[],
    descriptions: string[],
  ) => void;
  onEventsAnalyzed: (events: EventRow[]) => void;
  session: Session;
  calendarId: string;
}

const EventList: React.FC<EventListProps> = ({
  onAddToCalendar,
  onAddToLocalCalendar,
  onEventsAnalyzed,
  session,
  calendarId,
}) => {
  const [events, setEvents] = useState<EventRow[]>([
    { id: 1, description: "" },
    { id: 2, description: "" },
    { id: 3, description: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState<number | null>(
    null,
  );

  const handleOpenModal = (index: number) => {
    setCurrentEventIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const updatedEvents = [...events];
    updatedEvents[index] = { ...updatedEvents[index], [name]: value };
    setEvents(updatedEvents);
  };

  const handleAddRow = () => {
    const newId = events.length > 0 ? events[events.length - 1].id + 1 : 1;
    setEvents([...events, { id: newId, description: "" }]);
  };

  const fetchGoogleCalendarEvents = async (
    session: Session,
    calendarId: string,
  ) => {
    try {
      const accessToken = session.provider_token;
      console.log(
        "Fetching Google Calendar events with access token:",
        accessToken,
      );

      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(now.setDate(now.getDate() + 30)).toISOString();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        },
      );

      if (response.status === 401) {
        console.log("Access token expired, refreshing token...");
        const newAccessToken = await refreshAccessToken(session);
        const newResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + newAccessToken,
            },
          },
        );
        return await newResponse.json();
      }

      const eventsData = await response.json();
      console.log("Fetched events:", eventsData);
      return eventsData;
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
      return null;
    }
  };

  const handleCallyAssist = async () => {
    setLoading(true);
    console.log("Cally assist button clicked");

    try {
      console.log("Fetching Google Calendar events");
      const googleEvents = await fetchGoogleCalendarEvents(session, calendarId);

      if (!googleEvents || !googleEvents.items) {
        console.error("No Google Calendar events fetched");
        setLoading(false);
        return;
      }

      const busyTimes = googleEvents.items.map((item: any) => ({
        start: new Date(item.start.dateTime || item.start.date).getTime(),
        end: new Date(item.end.dateTime || item.end.date).getTime(),
      }));

      console.log("Fetched busy times:", busyTimes);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "User events for scheduling" },
            ...events
              .filter((event) => event.description.trim() !== "")
              .map((event) => ({
                role: "user",
                id: event.id,
                content: `Find the best time to schedule an event with description "${
                  event.description
                }", which should be completed by ${
                  event.dueDate
                }. It should take a maximum of ${
                  event.maxHours
                } hours and it is ${
                  event.isRecurring ? "recurring" : "a single task"
                }.`,
              })),
          ],
        }),
      });

      console.log("Cally API response received");

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        const updatedEvents = events.map((event) => {
          const result = data.find((item: any) => item.id === event.id);
          return {
            ...event,
            bestTime: result
              ? result.steps
                  .map((step: any) => `${step.time} (${step.description})`)
                  .join(". ")
              : "No suggestion",
          };
        });

        console.log("Updated events with Cally suggestions:", updatedEvents);

        updatedEvents.forEach((event) => {
          if (event.bestTime) {
            const suggestedTimes = event.bestTime.split(". ");
            const dueDate = event.dueDate
              ? new Date(event.dueDate)
              : new Date(); // Provide a default value
            const today = new Date();
            const daysUntilDue = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            const hoursPerDay = event.maxHours
              ? event.maxHours / daysUntilDue
              : 1; // Provide a default value

            let currentDay = new Date(today);
            let totalAssignedHours = 0;

            const distributedTimes = suggestedTimes
              .map((time: string) => {
                const [startTime, ...rest] = time.split(" ");
                const [hour, minute] = startTime.split(":").map(Number);
                let eventTime = new Date(currentDay);
                eventTime.setHours(hour, minute, 0, 0);

                if (isNaN(eventTime.getTime())) {
                  console.error("Invalid event time:", eventTime);
                  return null;
                }

                while (
                  busyTimes.some(
                    (busy: { start: number; end: number }) =>
                      eventTime.getTime() >= busy.start &&
                      eventTime.getTime() < busy.end,
                  ) ||
                  totalAssignedHours >= hoursPerDay
                ) {
                  currentDay.setDate(currentDay.getDate() + 1);
                  totalAssignedHours = 0;
                  eventTime = new Date(currentDay);
                  eventTime.setHours(hour, minute, 0, 0);
                }

                totalAssignedHours += 0.5; // increment by 0.5 for each 30-minute slot
                return `${eventTime.toISOString()} (${rest.join(" ")})`;
              })
              .filter((time: string | null): time is string => time !== null);

            event.bestTime = distributedTimes.join(". ");
          }
        });

        console.log(
          "Final updated events with distributed times:",
          updatedEvents,
        );

        setEvents(updatedEvents);
        onEventsAnalyzed(updatedEvents);
      } else {
        console.error("Cally API response error:", data.error);
        toast.error(
          data.error || "Failed to get scheduling advice from Cally.",
        );
      }
    } catch (error) {
      console.error("An error occurred while fetching data from Cally:", error);
      toast.error("An error occurred while fetching data from Cally.");
    }

    setLoading(false);
    console.log("Cally assist processing completed");
  };

  const handleAddToCalendar = (event: EventRow) => {
    const timesAndDescriptions = event.bestTime
      ?.split(". ")
      .map((timeAndDesc) => {
        const parts = timeAndDesc.split(" - ");
        const time = parts[0].trim();
        const description = parts.slice(1).join(" - ").trim();
        return { time, description };
      })
      .filter(({ time, description }) => time && description);

    if (timesAndDescriptions) {
      const times = timesAndDescriptions.map(({ time }) => time);
      const descriptions = timesAndDescriptions.map(
        ({ description }) => description,
      );
      console.log("Parsed times:", times);
      console.log("Parsed descriptions:", descriptions);
      onAddToCalendar(event, times, descriptions);
    } else {
      console.error("Failed to parse times or descriptions from bestTime.");
    }
  };

  const handleAddToLocalCalendar = (event: EventRow) => {
    const timesAndDescriptions = event.bestTime
      ?.split(". ")
      .map((timeAndDesc) => {
        const parts = timeAndDesc.split(" - ");
        const time = parts[0].trim();
        const description = parts.slice(1).join(" - ").trim();
        return { time, description };
      })
      .filter(({ time, description }) => time && description);

    if (timesAndDescriptions) {
      const times = timesAndDescriptions.map(({ time }) => time);
      const descriptions = timesAndDescriptions.map(
        ({ description }) => description,
      );
      console.log("Parsed times:", times);
      console.log("Parsed descriptions:", descriptions);
      onAddToLocalCalendar(event, times, descriptions);
    } else {
      console.error("Failed to parse times or descriptions from bestTime.");
    }
  };

  return (
    <div className={styles["event-list"]}>
      {events.map((event, index) => (
        <div key={event.id} className={styles["event-row"]}>
          <span className={styles["event-number"]}>{index + 1}</span>
          <button
            onClick={() => handleOpenModal(index)}
            className={styles["event-button"]}
          >
            Add Event Details
          </button>
          {event.bestTime && (
            <div className={styles["best-time"]}>
              Best Time: {event.bestTime}
              <button
                className={styles["calendar-button"]}
                onClick={() => handleAddToLocalCalendar(event)}
              >
                Add to Local Calendar
              </button>
              <button
                className={styles["calendar-button"]}
                onClick={() => handleAddToCalendar(event)}
              >
                View on Calendar
              </button>
            </div>
          )}
        </div>
      ))}
      <div className={styles["button-container"]}>
        <button onClick={handleAddRow} className={styles["add-row-button"]}>
          Add a row
        </button>
        <button
          onClick={handleCallyAssist}
          className={styles["analyze-button"]}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Let Cally assist you"}
        </button>
      </div>

      {isModalOpen && currentEventIndex !== null && (
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={handleCloseModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Add Event Details
                    </Dialog.Title>
                    <div className="mt-2">
                      <textarea
                        name="description"
                        value={events[currentEventIndex].description}
                        onChange={(e) =>
                          handleInputChange(currentEventIndex, e)
                        }
                        placeholder="Event Description"
                        className="w-full p-2 border rounded"
                      />
                      <div className="mt-4">
                        <label className="block text-gray-700">
                          Is this a single task or recurring?
                        </label>
                        <select
                          name="isRecurring"
                          value={
                            events[currentEventIndex].isRecurring
                              ? "recurring"
                              : "single"
                          }
                          onChange={(e) =>
                            handleInputChange(currentEventIndex, {
                              target: {
                                name: "isRecurring",
                                value: e.target.value === "recurring",
                              },
                            } as unknown as React.ChangeEvent<HTMLInputElement>)
                          }
                          className="w-full p-2 border rounded"
                        >
                          <option value="single">Single</option>
                          <option value="recurring">Recurring</option>
                        </select>
                      </div>
                      <div className="mt-4">
                        <label className="block text-gray-700">
                          How many hours do you want to spend at most?
                        </label>
                        <input
                          type="number"
                          name="maxHours"
                          value={events[currentEventIndex].maxHours || ""}
                          onChange={(e) =>
                            handleInputChange(currentEventIndex, e)
                          }
                          placeholder="Max hours"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-gray-700">
                          What is the date this event should be completed by?
                        </label>
                        <input
                          type="date"
                          name="dueDate"
                          value={events[currentEventIndex].dueDate || ""}
                          onChange={(e) =>
                            handleInputChange(currentEventIndex, e)
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                        onClick={handleCloseModal}
                      >
                        Save
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default EventList;
