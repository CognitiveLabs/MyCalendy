"use client";
import React, { useState, useEffect } from "react";
import DateTimePicker from "react-datetime-picker";
import { createClient } from "@/utils/supabase/client";
import "./account.css";

const CalendarEvent = () => {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [session, setSession] = useState(null); // State to store user session
  const [providerAccessToken, setProviderAccessToken] = useState(""); // State to store provider access token

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient();
      const { data: session, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user session:", error.message);
        return;
      }

      console.log("User session:", session);

      supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.provider_token) {
          window.localStorage.setItem(
            "oauth_provider_token",
            session.provider_token,
          );
        }

        if (session && session.provider_refresh_token) {
          window.localStorage.setItem(
            "oauth_provider_refresh_token",
            session.provider_refresh_token,
          );
        }

        if (event === "SIGNED_OUT") {
          window.localStorage.removeItem("oauth_provider_token");
          window.localStorage.removeItem("oauth_provider_refresh_token");
        }
      });
    };

    fetchSession();
  }, []);

  const clearData = () => {
    setStart(new Date());
    setEnd(new Date());
    setEventName("");
    setEventDescription("");
  };

  async function createCalendarEvent() {
    if (!providerAccessToken) {
      console.error("Provider access token not found.");
      return;
    }
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
          Authorization: "Bearer " + providerAccessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      },
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Event created, check your Google Calendar!");
      })
      .catch((error) => {
        console.error("Error creating calendar event:", error);
      });
  }

  async function googleSignIn() {
    const supabase = createClient(); // Create Supabase client
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar",
      },
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
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
      <button onClick={() => googleSignIn()}>Sign in with Google</button>
      <br />
      <br />
    </>
  );
};

export default CalendarEvent;
