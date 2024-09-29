"use client";

import EnergyForm from "../sliders/EnergyFinal";
import MorningForm from "../sliders/MorningFinal";
import { EventSourceInput } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  Draggable,
  DropArg,
} from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar"; // Import the Google Calendar plugin
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import EventList, { EventRow } from "./EventList";
import Projects from "./Projects";
import { toast } from "react-toastify";

interface Event {
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  id: number;
}

interface Session {
  provider_token: string;
  provider_refresh_token: string;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user?: any;
}

async function refreshAccessToken(session: Session) {
  try {
    console.log(
      "Refreshing access token using refresh token:",
      session.provider_refresh_token,
    );

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
        refresh_token: session.provider_refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const responseData = await response.json();
    if (response.ok) {
      console.log("New access token:", responseData.access_token);
      return responseData.access_token;
    } else {
      console.error("Error refreshing token:", responseData);
      throw new Error("Failed to refresh access token");
    }
  } catch (error) {
    console.error("Exception during token refresh:", error);
    throw error;
  }
}

async function createAddEvent(event: Event, session: Session) {
  try {
    console.log("Creating calendar event");
    console.log("Session data:", session); // Log session data for debugging

    let accessToken = session.provider_token;
    console.log("Session provider token:", accessToken); // Log token for debugging

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: new Date(event.start).toISOString(), // Ensure correct date format
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(event.start).toISOString(), // Ensure correct date format
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    let response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify(googleEvent),
      },
    );

    if (response.status === 401) {
      console.log("Access token expired, refreshing token...");
      accessToken = await refreshAccessToken(session);
      response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          body: JSON.stringify(googleEvent),
        },
      );
    }

    const responseData = await response.json();
    if (response.ok) {
      console.log(responseData);
      alert("Event created, check your Google Calendar!");
    } else {
      console.error("Error creating event:", responseData);
      alert("Error creating event. Check console for details.");
    }
  } catch (error) {
    console.error("Error creating event:", error);
    alert("Error creating event. Check console for details.");
  }
}

async function fetchGoogleCalendarEvents(session: Session, calendarId: string) {
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
    console.log("Fetched events:", eventsData); // Log fetched events for debugging
    return eventsData;
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    return null;
  }
}

export default function Home({ session }: { session: Session }) {
  const [events, setEvents] = useState([
    {
      title: "hold to drag",
      description: "Description for event 1",
      id: "1",
    },
  ]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    description: "",
    start: "",
    end: "",
    allDay: false,
    id: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [analyzedEvents, setAnalyzedEvents] = useState<EventRow[]>([]); // New state
  const supabase = createClient();
  const draggableEl = useRef(null);
  const calendarId = "primary";
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const googleEvents = await fetchGoogleCalendarEvents(session, calendarId);

      if (googleEvents && googleEvents.items) {
        const formattedEvents = googleEvents.items.map((item: any) => ({
          title: item.summary || "No Title",
          start: new Date(item.start.dateTime || item.start.date).toISOString(),
          end: new Date(item.end.dateTime || item.end.date).toISOString(),
          allDay: !item.start.dateTime,
          description: item.description || "",
          id: item.id, // Make sure this is a number
        }));

        console.log("Formatted events:", formattedEvents); // Log formatted events for debugging
        setAllEvents(formattedEvents); // Set the formatted events
      }
    };

    fetchEvents();
  }, [session]);

  useEffect(() => {
    let draggableEl = document.getElementById("draggable-el");
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          let title = eventEl.getAttribute("title");
          let id = eventEl.getAttribute("data");
          let start = eventEl.getAttribute("start");
          return { title, id, start };
        },
      });
    }
  }, []);

  function handleDateClick(arg: { date: Date; allDay: boolean }) {
    setNewEvent({
      ...newEvent,
      start: arg.date.toISOString().slice(0, 16),
      allDay: arg.allDay,
      id: new Date().getTime(),
    });
    setIsEditing(false);
    setShowModal(true);
  }

  function addEvent(data: DropArg) {
    const event = {
      ...newEvent,
      start: new Date(data.date).toISOString().slice(0, 16),
      title: data.draggedEl.innerText,
      allDay: data.allDay,
      id: new Date().getTime(),
    };
    setAllEvents([...allEvents, event]);
  }

  function handleDeleteEvent(eventId: number) {
    setAllEvents(allEvents.filter((event) => event.id !== eventId));
  }

  function handleDeleteModal(data: { event: { id: string } }) {
    setShowDeleteModal(true);
    setIdToDelete(Number(data.event.id));
  }

  function handleDelete() {
    setAllEvents(
      allEvents.filter((event) => Number(event.id) !== Number(idToDelete)),
    );
    setShowDeleteModal(false);
    setIdToDelete(null);
  }

  function handleCloseModal() {
    setShowModal(false);
    setNewEvent({
      title: "",
      description: "",
      start: "",
      end: "",
      allDay: false,
      id: 0,
    });
    setShowDeleteModal(false);
    setIdToDelete(null);
    setEventToEdit(null);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isEditing && eventToEdit) {
      const updatedEvents = allEvents.map((event) =>
        event.id === eventToEdit.id ? newEvent : event,
      );
      setAllEvents(updatedEvents);
    } else {
      setAllEvents([...allEvents, newEvent]);
    }
    setShowModal(false);
    setNewEvent({
      title: "",
      description: "",
      start: "",
      end: "",
      allDay: false,
      id: 0,
    });
    setIsEditing(false);
    setEventToEdit(null);
  }

  async function handleAddToGoogleCalendar(event: Event) {
    try {
      await createAddEvent(event, session);
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
      alert(
        "Error adding event to Google Calendar. Check console for details.",
      );
    }
  }

  async function getSessionTokens(supabase: any, session: any) {
    const { data: authSession } = await supabase.auth.getSession();
    if (!authSession) {
      throw new Error("No session found");
    }

    const provider_token = session?.provider_token;
    const provider_refresh_token = session?.provider_refresh_token;

    return { provider_token, provider_refresh_token };
  }

  function handleEventClick(data: { event: { id: string } }) {
    const event = allEvents.find((evt) => evt.id === Number(data.event.id));
    if (event) {
      setSelectedEvent(event);
      setShowEventDetailsModal(true);
    }
  }

  function eventContent(eventInfo: any) {
    return (
      <div className="flex justify-between items-center">
        <span>{eventInfo.event.title}</span>
        {eventInfo.view.type !== "list" && (
          <TrashIcon
            className="h-5 w-5 text-red-600 cursor-pointer trash-icon"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the edit modal
              handleDeleteModal({ event: { id: eventInfo.event.id } });
            }}
          />
        )}
      </div>
    );
  }

  const handleAddEventToCalendar = async (
    event: EventRow,
    times: string[],
    descriptions: string[],
  ) => {
    console.log("handleAddEventToCalendar called with:", {
      event,
      times,
      descriptions,
    });

    try {
      const accessToken = session.provider_token;

      for (let i = 0; i < times.length; i++) {
        const timeString = times[i].split(" ")[0]; // Extract the correct time string
        const startTime = new Date(timeString).toISOString();
        const endTime = new Date(
          new Date(timeString).getTime() + 45 * 60 * 1000,
        ).toISOString(); // 45 minutes duration

        const calendarEvent = {
          summary: event.description,
          description: descriptions[i],
          start: {
            dateTime: startTime, // Ensure correct date format
          },
          end: {
            dateTime: endTime, // Ensure correct date format
          },
        };

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(calendarEvent),
          },
        );

        if (!response.ok) {
          console.error(
            "Failed to add event to Google Calendar",
            await response.json(),
          );
          toast.error("Failed to add event to Google Calendar");
        } else {
          console.log("Event added to Google Calendar", await response.json());
          toast.success("Event added to Google Calendar");
        }
      }
    } catch (error) {
      console.error(
        "An error occurred while adding event to Google Calendar:",
        error,
      );
      toast.error("An error occurred while adding event to Google Calendar.");
    }
  };

  const handleAddToLocalCalendar = (
    event: EventRow,
    times: string[],
    descriptions: string[],
  ) => {
    console.log("Adding to local calendar:", { event, times, descriptions });
    // Add your logic to handle adding events to the local calendar here
  };

  return (
    <>
      <nav className="flex justify-between mb-12 border-b border-violet-100 p-4">
        <h1 className="font-bold text-2xl text-gray-700">Calendar</h1>
      </nav>
      <div className="sliders-container flex">
        <div className="slider-item" style={{ flex: 1, textAlign: "right" }}>
          <MorningForm />
        </div>
        <div className="slider-item" style={{ flex: 1, textAlign: "left" }}>
          <EnergyForm />
        </div>
      </div>

      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="w-full">
          <div className="grid grid-cols-10">
            <div className="col-span-10">
              <FullCalendar
                plugins={[
                  dayGridPlugin,
                  interactionPlugin,
                  timeGridPlugin,
                  googleCalendarPlugin,
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek",
                }}
                events={allEvents.map((event) => ({
                  ...event,
                  id: event.id.toString(), // Convert id to string for FullCalendar
                }))} // This ensures the id is a string when passed to FullCalendar
                nowIndicator={true}
                editable={true}
                droppable={true}
                selectable={true}
                selectMirror={true}
                dateClick={handleDateClick}
                eventClick={handleEventClick} // Add this line
              />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="descriptive-paragraph">
              <p>
                You can drag an event to where you&apos;d like to schedule it,
                or you can enter the details of the event in the form below and
                let Cally (your personal assistant) add the event to your
                calendar based on your inputs where you can finalize it and add
                it to your Google Calendar.
              </p>
            </div>
            <div
              id="draggable-el"
              ref={draggableEl}
              className="border-2 p-2 rounded-md draggable overflow-y-auto flex justify-center"
            >
              <div className="w-96">
                <h1 className="font-bold text-lg text-center">Create Event</h1>
                <div className="event-container">
                  {events.map((event) => (
                    <div
                      className="fc-event border-2 p-1 m-2 w-auto rounded-md text-center bg-white draggabletext"
                      title={event.title}
                      key={event.id}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <EventList
            onAddToCalendar={handleAddEventToCalendar}
            onAddToLocalCalendar={handleAddToLocalCalendar}
            onEventsAnalyzed={(events) =>
              console.log("Events analyzed:", events)
            }
            session={session}
            calendarId={calendarId}
          />
          <Projects events={analyzedEvents} />{" "}
        </div>

        <Transition.Root show={showDeleteModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setShowDeleteModal}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            Delete event
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete this event? All of
                              your data will be permanently removed. This action
                              cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            {isEditing ? "Edit Event" : "Add Event"}
                          </Dialog.Title>
                          <div className="mt-2">
                            <form
                              onSubmit={handleSubmit}
                              className="grid grid-cols-1 gap-y-6"
                            >
                              <div>
                                <label
                                  htmlFor="title"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Title
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    autoComplete="title"
                                    required
                                    value={newEvent.title}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor="description"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Description
                                </label>
                                <div className="mt-1">
                                  <textarea
                                    id="description"
                                    name="description"
                                    autoComplete="description"
                                    required
                                    value={newEvent.description}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor="start"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Start
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="start"
                                    name="start"
                                    type="datetime-local"
                                    autoComplete="start"
                                    required
                                    value={newEvent.start as string}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center">
                                <input
                                  id="allDay"
                                  name="allDay"
                                  type="checkbox"
                                  checked={newEvent.allDay}
                                  onChange={(e) =>
                                    setNewEvent({
                                      ...newEvent,
                                      allDay: e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label
                                  htmlFor="allDay"
                                  className="ml-2 block text-sm text-gray-900"
                                >
                                  All Day
                                </label>
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button
                                  type="button"
                                  className="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                  onClick={handleCloseModal}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                  {isEditing ? "Save Changes" : "Add Event"}
                                </button>
                                <button
                                  type="button"
                                  className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                  onClick={() =>
                                    handleAddToGoogleCalendar(newEvent)
                                  }
                                >
                                  Add to Google Calendar
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            {isEditing ? "Edit Event" : "Add Event"}
                          </Dialog.Title>
                          <div className="mt-2">
                            <form
                              onSubmit={handleSubmit}
                              className="grid grid-cols-1 gap-y-6"
                            >
                              <div>
                                <label
                                  htmlFor="title"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Title
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    autoComplete="title"
                                    required
                                    value={newEvent.title}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor="description"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Description
                                </label>
                                <div className="mt-1">
                                  <textarea
                                    id="description"
                                    name="description"
                                    autoComplete="description"
                                    required
                                    value={newEvent.description}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor="start"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Start
                                </label>
                                <div className="mt-1">
                                  <input
                                    id="start"
                                    name="start"
                                    type="datetime-local"
                                    autoComplete="start"
                                    required
                                    value={newEvent.start as string}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center">
                                <input
                                  id="allDay"
                                  name="allDay"
                                  type="checkbox"
                                  checked={newEvent.allDay}
                                  onChange={(e) =>
                                    setNewEvent({
                                      ...newEvent,
                                      allDay: e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label
                                  htmlFor="allDay"
                                  className="ml-2 block text-sm text-gray-900"
                                >
                                  All Day
                                </label>
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button
                                  type="button"
                                  className="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                  onClick={handleCloseModal}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                  {isEditing ? "Save Changes" : "Add Event"}
                                </button>
                                <button
                                  type="button"
                                  className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                  onClick={() =>
                                    handleAddToGoogleCalendar(newEvent)
                                  } // Pass session tokens
                                >
                                  Add to Google Calendar
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Transition.Root show={showEventDetailsModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setShowEventDetailsModal(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            Event Details
                          </Dialog.Title>
                          <div className="mt-2">
                            <p>
                              <strong>Title:</strong> {selectedEvent?.title}
                            </p>
                            <p>
                              <strong>Description:</strong>{" "}
                              {selectedEvent?.description}
                            </p>
                          </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setShowEventDetailsModal(false)}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </main>
    </>
  );
}
