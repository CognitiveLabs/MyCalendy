"use client";
import React, { useState } from "react";
import styles from "./EventList.module.css"; // Import the CSS module

interface EventRow {
  name: string;
  description: string;
}

const EventList = () => {
  const [events, setEvents] = useState<EventRow[]>([
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
  ]);

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
    setEvents([...events, { name: "", description: "" }]);
  };

  return (
    <div className={styles["event-list"]}>
      {events.map((event, index) => (
        <div key={index} className={styles["event-row"]}>
          <span className={styles["event-number"]}>{index + 1}</span>
          <input
            type="text"
            name="name"
            value={event.name}
            onChange={(e) => handleInputChange(index, e)}
            placeholder="Event Name"
            className={styles["event-input"]}
          />
          <input
            type="text"
            name="description"
            value={event.description}
            onChange={(e) => handleInputChange(index, e)}
            placeholder="Event Description"
            className={styles["event-input"]}
          />
        </div>
      ))}
      <button onClick={handleAddRow} className={styles["add-row-button"]}>
        +
      </button>
    </div>
  );
};

export default EventList;