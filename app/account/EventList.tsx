"use client";

import React, { useState } from "react";
import styles from "./EventList.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface EventRow {
  id: number;
  description: string;
  bestTime?: string; // Added bestTime property to store Cally's suggestion
}

const EventList = () => {
  const [events, setEvents] = useState<EventRow[]>([
    { id: 1, description: "" },
    { id: 2, description: "" },
    { id: 3, description: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
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
      const nonEmptyEvents = events.filter(
        (event) => event.description.trim() !== "",
      );
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "User events for scheduling" },
            ...nonEmptyEvents.map((event) => ({
              role: "user",
              id: event.id, // Include the ID in the message
              content: `Find the best time to schedule the event with description "${event.description}".`,
            })),
          ],
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const updatedEvents = events.map((event) => {
          if (event.description.trim() === "") {
            return event; // Skip empty events
          }
          const result = data.find((item: any) => item.id === event.id);
          return {
            ...event,
            bestTime: result ? result.bestTime : "No suggestion",
          };
        });
        setEvents(updatedEvents);
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

  return (
    <div className={styles["event-list"]}>
      {events.map((event, index) => (
        <div key={event.id} className={styles["event-row"]}>
          <span className={styles["event-number"]}>{index + 1}</span>
          <input
            type="text"
            name="description"
            value={event.description}
            onChange={(e) => handleInputChange(index, e)}
            placeholder="Event Description"
            className={styles["event-input"]}
          />
          {event.bestTime && (
            <div className={styles["best-time"]}>
              Best Time: {event.bestTime}
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
    </div>
  );
};

export default EventList;
