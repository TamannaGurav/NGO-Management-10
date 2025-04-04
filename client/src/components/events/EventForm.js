import React, { useState, useEffect } from "react";
import { addEvent, updateEvent } from "../../api/eventsApi"; // Import updateEvent

const EventForm = ({ selectedEvent, setEvents, onClearSelection }) => {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState(""); // Add time state
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [targetDonation, setTargetDonation] = useState("");

    useEffect(() => {
        if (selectedEvent) {
            setName(selectedEvent.name);
            setDate(selectedEvent.date ? selectedEvent.date.slice(0, 10) : ""); // Corrected line
            // Extract time from the date string, if available
            if (selectedEvent.date) {
                const dateObj = new Date(selectedEvent.date);
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                setTime(`${hours}:${minutes}`);
            } else {
                setTime("");
            }
            setLocation(selectedEvent.location);
            setDescription(selectedEvent.description);
            setTargetDonation(selectedEvent.targetDonation);
        } else {
            // Clear form when selectedEvent is null
            setName("");
            setDate("");
            setLocation("");
            setDescription("");
            setTargetDonation("");
        }
    }, [selectedEvent]);

    const handleSubmit = async (e) => {
        e.preventDefault();

                // Combine date and time into a single ISO 8601 string
                const dateTime = date && time ? `${date}T${time}:00.000Z` : null;

        const eventData = {
            name,
            date:dateTime,
            location,
            description,
            targetDonation: Number(targetDonation) || 0,
        };

        try {
            if (selectedEvent) {
                // Update event
                const updatedEvent = await updateEvent(selectedEvent._id, eventData);
                setEvents((prevEvents) =>
                    prevEvents.map((event) =>
                        event._id === updatedEvent.event._id ? updatedEvent.event : event
                    )
                );
                console.log("Event updated successfully!", updatedEvent);
            } else {
                // Add event
                const newEvent = await addEvent(eventData);
                setEvents((prevEvents) => [...prevEvents, newEvent.event]);
                console.log("Event added successfully!", newEvent);
            }
            onClearSelection(); // Clear selection and form
        } catch (error) {
            console.error("Error saving event:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Event Name" required />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
            <input type="number" value={targetDonation} onChange={(e) => setTargetDonation(e.target.value)} placeholder="Target Donation" required />
            <button type="submit">{selectedEvent ? "Update Event" : "Add Event"}</button>
            {selectedEvent && <button type="button" onClick={onClearSelection}>Clear</button>}
        </form>
    );
};

export default EventForm;