"use client";
import React, { useState } from "react";
import DateTimePicker from "react-datetime-picker";
import { createClient } from "@/utils/supabase/client";

interface Session {
  provider_token: string;
  provider_refresh_token: string;
}

const AddEvent = ({ session }: { session: Session }) => {
  const [start, setStart] = useState<Date | null>(new Date());
  const [end, setEnd] = useState<Date | null>(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const supabase = createClient();

  const clearData = () => {
    setStart(new Date());
    setEnd(new Date());
    setEventName("");
    setEventDescription("");
  };

  async function refreshAccessToken() {
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

  async function createAddEvent() {
    try {
      console.log("Creating calendar event");
      console.log("Session data:", session); // Log session data for debugging

      let accessToken = session.provider_token;
      console.log("Session provider token:", accessToken); // Log token for debugging

      const event = {
        summary: eventName,
        description: eventDescription,
        start: {
          dateTime: start!.toISOString(), // Non-null assertion
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: end!.toISOString(), // Non-null assertion
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
          body: JSON.stringify(event),
        },
      );

      if (response.status === 401) {
        console.log("Access token expired, refreshing token...");
        accessToken = await refreshAccessToken();
        response = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + accessToken,
            },
            body: JSON.stringify(event),
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
      <button onClick={createAddEvent}>Create Calendar Event</button>
      <p></p>
      <button onClick={clearData}>Refresh Calendar Event</button>
      <br />
      <br />
    </>
  );
};

export default AddEvent;
