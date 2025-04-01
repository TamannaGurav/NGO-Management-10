const Task = require("../models/taskModel");

/**
 * Create a new task for the logged-in user's NGO.
 * Only 'admin' and 'staff' are allowed to create tasks.
 */
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    const ngoId = req.user.ngoId;
    if (!ngoId) {
      return res.status(400).json({ message: "User is not linked to any NGO" });
    }

    const newTask = new Task({
      title,
      description,
      assignedTo,
      dueDate,
      ngoId,
    });
    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all tasks for the logged-in user's NGO.
 * - Volunteers: Only tasks assigned to them.
 * - Admins/Staff: All tasks of the NGO.
 */
const getAllTasks = async (req, res) => {
  try {
    const ngoId = req.user.ngoId;
    if (!ngoId) {
      return res.status(400).json({ message: "User is not linked to any NGO" });
    }
    
    let tasks;
    if (req.user.role === "volunteer") {
      tasks = await Task.find({ ngoId, assignedTo: req.user._id });
    } else {
      tasks = await Task.find({ ngoId });
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a specific task by its ID.
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Task does not belong to your NGO" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a task's details.
 * Only 'admin' and 'staff' can update tasks.
 */
const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, dueDate } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Task does not belong to your NGO" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;

    await task.save();
    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a task.
 * Only admins are allowed to delete tasks.
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Task does not belong to your NGO" });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * Volunteer updates task status (only allowed field).
 * If a volunteer marks a task as "completed", it sets the status to "pending_confirmation".
 */
const updateTaskStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      // Ensure the task belongs to the user's NGO
      if (task.ngoId.toString() !== req.user.ngoId.toString()) {
        return res.status(403).json({ message: "Access denied: Task does not belong to your NGO" });
      }
      
      // Volunteers can only update status. If they try to update to "completed", set it to "pending_confirmation"
      if (req.user.role === "volunteer") {
        if (status === "completed") {
          task.status = "pending_confirmation";
          // Trigger a notification to admin (for now, just log it)
          console.log(`Notification: Volunteer ${req.user.email} marked task ${task._id} as completed. Awaiting admin confirmation.`);
        } else if (["pending", "in-progress"].includes(status)) {
          task.status = status;
        } else {
          return res.status(400).json({ message: "Volunteers can only update status to 'pending', 'in-progress', or 'completed' (which sets to pending_confirmation)." });
        }
      } else {
        // For admin or staff, allow full update of status
        task.status = status;
      }
      
      await task.save();
      res.status(200).json({ message: "Task status updated successfully", task });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  /**
   * Admin confirms a task's completion.
   * This endpoint is used by admins to review tasks that volunteers have marked as completed (pending confirmation)
   * and finalize the status to "completed".
   */
  const confirmTaskCompletion = async (req, res) => {
    try {
      // Only admin can confirm
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Only admin can confirm task completion." });
      }
      
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      // Ensure the task belongs to the admin's NGO
      if (task.ngoId.toString() !== req.user.ngoId.toString()) {
        return res.status(403).json({ message: "Access denied: Task does not belong to your NGO" });
      }
      
      // Check if the task is in pending_confirmation status
      if (task.status !== "pending_confirmation") {
        return res.status(400).json({ message: "Task is not awaiting confirmation." });
      }
      
      // Finalize the task status to "completed"
      task.status = "completed";
      await task.save();
      res.status(200).json({ message: "Task completion confirmed", task });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

module.exports = { createTask,  updateTaskStatus,
    confirmTaskCompletion, getAllTasks, getTaskById, updateTask, deleteTask };
