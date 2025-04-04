const Event = require('../models/eventModel');

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { name, date, location, description, targetDonation } = req.body;
    const event = new Event({
      name,
      date,
      location,
      description,
      targetDonation,
      createdBy: req.user.id,  // Assuming user is logged in and their ID is available
    });
    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
};

// Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

// Get Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event details', error });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const { name, date, location, description, targetDonation, status } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,  // Using :id parameter from route
      { name, date, location, description, targetDonation, status },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
};

// Register Participant for an Event (optional based on your needs)
exports.addParticipant = async (req, res) => {
  try {
    const { eventId } = req.body;  // Assuming you're passing event ID in the body
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user is already registered (optional, you can remove this if not needed)
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    event.participants.push(req.user.id); // Add the user to the participants list
    await event.save();

    res.status(200).json({ message: 'Successfully registered for the event', event });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error });
  }
};
