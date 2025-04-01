const express = require("express");
const router = express.Router();
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require("../controllers/eventController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorize");

// Create a new event (admins and staff only)
router.post("/", protect, authorize("admin", "staff"), createEvent);

// Get all events for the NGO (accessible to all roles)
router.get("/", protect, getAllEvents);

// Get a specific event by ID
router.get("/:id", protect, getEventById);

// Update an event (admins and staff only)
router.put("/:id", protect, authorize("admin", "staff"), updateEvent);

// Delete an event (admins only)
router.delete("/:id", protect, authorize("admin"), deleteEvent);

module.exports = router;
