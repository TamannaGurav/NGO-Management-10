const Event = require("../models/eventModel");

/**
 * Create a new event for an NGO.
 * Only admins and staff can create events.
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, location, eventDate } = req.body;
    const ngoId = req.user.ngoId;
    if (!ngoId) {
      return res.status(400).json({ message: "User is not linked to any NGO" });
    }
    
    const newEvent = new Event({
      title,
      description,
      location,
      eventDate,
      ngoId,
    });
    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all events for the NGO.
 * Accessible by admins, staff, and volunteers (volunteers might see only upcoming events, for example).
 */
const getAllEvents = async (req, res) => {
  try {
    const ngoId = req.user.ngoId;
    if (!ngoId) {
      return res.status(400).json({ message: "User is not linked to any NGO" });
    }
    const events = await Event.find({ ngoId });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get an event by ID.
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Event does not belong to your NGO" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update an event.
 * Only admins and staff can update events.
 */
const updateEvent = async (req, res) => {
  try {
    const { title, description, location, eventDate } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Event does not belong to your NGO" });
    }
    
    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    if (eventDate) event.eventDate = eventDate;
    
    await event.save();
    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete an event.
 * Only admins can delete events.
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Event does not belong to your NGO" });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
