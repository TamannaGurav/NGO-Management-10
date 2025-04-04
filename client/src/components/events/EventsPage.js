import React, { useEffect, useState } from "react";
import EventList from "./EventList";
import EventForm from "./EventForm";
import { getEvents } from "../../api/eventsApi"; // Function to fetch events
import { useNavigate } from "react-router-dom";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")); // Get logged-in user
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect if not logged in
      return;
    }
  
    let isMounted = true; // ✅ Prevent state updates if component unmounts
  
    const fetchEvents = async () => {
      try {
        const response = await getEvents(); // Fetch events
        if (isMounted) setEvents(response);console.log("Fetched Events:", response);
        // ✅ Only update if component is still mounted
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
  
    fetchEvents();
  
    return () => {
      isMounted = false; // ✅ Cleanup function to prevent double state updates
    };
  }, [navigate]);
  

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {/* Show only the Event List for all users */}
      <EventList events={events} />

      {/* Show CRUD options only for Admin & Staff */}
      {user?.role !== "volunteer" && <EventForm setEvents={setEvents} />}

    </div>
  );
};

export default EventsPage;
