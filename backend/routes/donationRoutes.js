const express = require("express");
const router = express.Router();
const { createDonation, getAllDonations, getDonationById, updateDonation, deleteDonation } = require("../controllers/donationController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authorize");

// Create a donation (admins and staff can record donations)
router.post("/", protect, authorize("admin", "staff"), createDonation);

// Get all donations (admins and staff)
router.get("/", protect, authorize("admin", "staff"), getAllDonations);

// Get a specific donation by ID
router.get("/:id", protect, getDonationById);

// Update a donation (admins and staff)
router.put("/:id", protect, authorize("admin", "staff"), updateDonation);

// Delete a donation (admins only)
router.delete("/:id", protect, authorize("admin"), deleteDonation);

module.exports = router;
