import axios from "axios";

const API_URL = "http://localhost:5000/api/events"; // Backend route for events

// 🔹 Fetch all events (Admins & Staff can see all, Volunteers get public ones)
export const getEvents = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error.response?.data || error);
    throw error;
  }
};

// 🔹 Fetch a single event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/${eventId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

// 🔹 Add a new event (Admins & Staff only)import axios from "axios";


export const addEvent = async (eventData) => {
  try {
    const token = localStorage.getItem("token"); // ✅ Ensure token is available

    const response = await axios.post(
      API_URL,
      { ...eventData }, // ✅ Make sure eventData is being passed correctly
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Ensure token is included
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding event:", error.response ? error.response.data : error);
    throw error;
  }
};


// 🔹 Update an event (Admins & Staff only)
export const updateEvent = async (eventId, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${eventId}`, updatedData, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

// 🔹 Delete an event (Admins only)
export const deleteEvent = async (eventId) => {
  try {
    await axios.delete(`${API_URL}/${eventId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// 🔹 Register a user for an event (Any user can register)
export const registerForEvent = async (eventId) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { eventId }, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error registering for event:", error);
    throw error;
  }
};
