const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');  // Assuming protect middleware is already in place
const { authorize } = require('../middlewares/authorize');  // Assuming authorize middleware is already in place

// Importing event controller methods
const { 
  createEvent, 
  getAllEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  addParticipant 
} = require('../controllers/eventController');

// Create Event (admins and staff only)
router.post('/', protect, authorize('admin', 'staff'), createEvent);

// Get All Events (public access or admins/staff as needed)
router.get('/', protect, getAllEvents);

// Get Event by ID (public access or admins/staff)
router.get('/:id', protect, authorize('admin', 'staff'), getEventById);

// Update Event (admins and staff only)
router.put('/:id', protect, authorize('admin', 'staff'), updateEvent);

// Delete Event (admins only)
router.delete('/:id', protect, authorize('admin'), deleteEvent);

// Register Participant for an Event (any user can register)
router.post('/register', protect, addParticipant);

module.exports = router;
