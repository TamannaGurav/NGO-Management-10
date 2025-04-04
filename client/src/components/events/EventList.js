import React from "react";
import { deleteEvent } from "../../api/eventsApi";

const EventList = ({ events, onEdit }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId);
      window.location.reload(); // Refresh to reflect changes
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <div>
      <h2>Events</h2>
      {events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        events.map((event) => (
          <div key={event._id}>
            <h3>{event.name}</h3>
            <p>Date: {new Date(event.date).toLocaleString()}</p>

            {/* Show Edit/Delete only for Admin & Staff */}
            {(user.role === "admin" || user.role === "staff") && (
              <>
                <button onClick={() => onEdit(event)}>Edit</button>
                <button onClick={() => handleDelete(event._id)}>Delete</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default EventList;
