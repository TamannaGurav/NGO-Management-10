const express = require("express");
const router = express.Router();
const { createTask, getAllTasks,  updateTaskStatus,
    confirmTaskCompletion, getTaskById, updateTask, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorize");
const Task = require("../models/taskModel");

// Create a new task (admins and staff only)
router.post("/", protect, authorize("admin", "staff"), createTask);

// Get all tasks (for admin, staff, or volunteer; volunteers see only tasks assigned to them)
// router.get("/tasks", protect, getAllTasks);

// Get a task by ID
router.get("/:id", protect, getTaskById);

// Update a task (admins and staff only)
router.put("/:id", protect, authorize("admin", "staff"), updateTask);

// Delete a task (admins only)
router.delete("/:id", protect, authorize("admin"), deleteTask);

// Volunteer updates task status only (this endpoint is for volunteers)
// They can update status to "completed" which sets it to "pending_confirmation"
router.put("/:id/status", protect, authorize("volunteer"), updateTaskStatus);

// Admin confirms a task's completion
router.put("/:id/confirm", protect, authorize("admin"), confirmTaskCompletion);


// Route to get tasks based on the user's role
// Route to get tasks based on the user's role
router.get('/', protect, async (req, res) => {
    try {
      const userRole = req.user.role; // This is fine
      const userId = req.user._id; // Use _id instead of id
    
      let tasks;
      if (userRole === 'volunteer') {
        tasks = await Task.find({ assignedTo: userId }); // This now correctly filters tasks
      } else if (['staff', 'admin', 'super_admin'].includes(userRole)) {
        tasks = await Task.find();
      } else {
        return res.status(403).json({ message: 'Not authorized' });
      }
    
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  

module.exports = router;
