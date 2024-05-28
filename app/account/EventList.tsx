"use client";

import React, { useState, Fragment } from "react";
import styles from "./EventList.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog, Transition } from "@headlessui/react";

export interface EventRow {
  id: number;
  description: string;
  bestTime?: string;
  isRecurring?: boolean;
  maxHours?: number;
  dueDate?: string;
}

interface EventListProps {
  onAddToCalendar: (event: EventRow, times: string[]) => void;
  onEventsAnalyzed: (events: EventRow[]) => void;
}

const EventList: React.FC<EventListProps> = ({
  onAddToCalendar,
  onEventsAnalyzed,
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

  const handleCallyAssist = async () => {
    setLoading(true);
    try {
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

      const data = await response.json();
      if (response.ok) {
        const updatedEvents = events.map((event) => {
          const result = data.find((item: any) => item.id === event.id);
          return {
            ...event,
            bestTime: result
              ? result.steps
                  .map((step: any) => `${step.time} - ${step.description}`)
                  .join(". ")
              : "No suggestion",
          };
        });
        setEvents(updatedEvents);
        onEventsAnalyzed(updatedEvents);
      } else {
        toast.error(
          data.error || "Failed to get scheduling advice from Cally.",
        );
      }
    } catch (error) {
      toast.error("An error occurred while fetching data from Cally.");
    }
    setLoading(false);
  };

  const handleAddToCalendar = (event: EventRow) => {
    const times = event.bestTime
      ?.split(".")
      .map((time) => time.trim())
      .filter((time) => time.match(/\b\d{2}:\d{2}\b/)); // Ensure valid time format
    console.log("Times to be added to calendar:", times); // Debugging
    onAddToCalendar(event, times || []);
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
