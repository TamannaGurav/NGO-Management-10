const express = require("express");
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorize");
const { approveAdmin } = require("../controllers/superAdminController");

const router = express.Router();

// User Registration
router.post("/register", protect, authorize("super_admin"), registerUser);

// User Login
router.post("/login", loginUser);

// Get Current User (Protected Route)
router.get("/me", protect, getMe);


// Approve NGO Request (Only Super Admin can approve new NGOs)
router.post("/approve-ngo", protect, authorize("super_admin"), (req, res) => {
    res.send("Super Admin approves NGO request here.");
});

// Super Admin approves admin
router.post("/approve/:userId", protect, authorize("super_admin"), approveAdmin);
module.exports = router;
