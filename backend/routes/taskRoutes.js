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
router.get("/", protect, getAllTasks);

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
// router.get('/', protect, async (req, res) => {
//     try {
//       const userRole = req.user.role; // This is fine
//       const userId = req.user._id; // Use _id instead of id
    
//       let tasks;
//       if (userRole === 'volunteer') {
//         tasks = await Task.find({ assignedTo: userId }); // This now correctly filters tasks
//       } else if (['staff', 'admin', 'super_admin'].includes(userRole)) {
//         tasks = await Task.find();
//       } else {
//         return res.status(403).json({ message: 'Not authorized' });
//       }
    
//       res.json(tasks);
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   });
  

// Route to change password
// router.put('/change-password', verifyToken, async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;
//     const userId = req.user.id; // Get user ID from the JWT

//     // Find the user
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Verify the old password
//     const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid old password' });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     // Update the password
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({ message: 'Password changed successfully' });
//   } catch (error) {
//     console.error('Error changing password:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// module.exports = router;

module.exports = router;
