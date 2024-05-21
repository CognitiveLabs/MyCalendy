"use client";
import React, { useState } from "react";
import DateTimePicker from "react-datetime-picker";
import { createClient } from "@/utils/supabase/client";

const CalendarEvent = ({ session }) => {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const supabase = createClient();

  const clearData = () => {
    setStart(new Date());
    setEnd(new Date());
    setEventName("");
    setEventDescription("");
  };

  async function createCalendarEvent() {
    console.log("Creating calendar event");
    if (!session || !session.provider_token) {
      console.error("No valid session or provider token found");
      alert("Authentication error, please log in again.");
      return;
    }

    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + session.provider_token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating event:", errorData);
        alert(`Error creating event: ${errorData.error.message}`);
        return;
      }

      const data = await response.json();
      console.log(data);
      alert("Event created, check your Google Calendar!");

    } catch (error) {
      console.error("Error creating event:", error);
      alert("An error occurred while creating the event.");
    }
  }

  return (
    <>
      <p>Start of your event</p>
      <DateTimePicker onChange={setStart} value={start} />
      <p>End of your event</p>
      <DateTimePicker onChange={setEnd} value={end} />
      <p>Event name</p>
      <input
        className="large-input"
        type="text"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />
      <p>Event description</p>
      <input
        className="large-input"
        type="text"
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value)}
      />
      <hr />
      <button onClick={() => createCalendarEvent()}>
        Create Calendar Event
      </button>
      <p></p>
      <button onClick={() => clearData()}>Refresh Calendar Event</button>{" "}
      <p></p>
      {/* <button onClick={() => signOut()}>Sign Out</button> */}
      <br />
      <br />
    </>
  );
};

export default CalendarEvent;
