"use client";
import React, { useState } from "react";
import DateTimePicker from "react-datetime-picker";
import { createClient } from "@/utils/supabase/client";

const CalendarEvent = () => {
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
    await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + session.provider_token,
        },
        body: JSON.stringify(event),
      },
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        alert("Event created, check your Google Calendar!");
      });
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
