const Donation = require("../models/donationModel");
/**
 * Create a new donation.
 * This endpoint can be accessed by admin and staff.
 */
const mongoose = require("mongoose"); // Add this if not already imported

const createDonation = async (req, res) => {
  console.log("Received Donation Data:", req.body);
  try {
    const { donorName, donorEmail, amount, paymentMethod } = req.body;

    if (!donorName || !donorEmail || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const ngoId = req.user.ngoId;
    console.log("User NGO ID:", ngoId);

    if (!ngoId) {
      return res.status(400).json({ message: "User is not linked to any NGO" });
    }

    const ObjectId = mongoose.Types.ObjectId;

    // Ensure ngoId is valid
    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ message: "Invalid NGO ID format" });
    }

    // Correctly create ObjectId
    const formattedNgoId = new mongoose.Types.ObjectId(ngoId);

    // Ensure amount is a valid number
    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ message: "Amount must be a valid positive number" });
    }

    // Create donation record
    const donation = new Donation({
      ngoId: formattedNgoId,
      donorName,
      donorEmail,
      amount: amountNumber,
      paymentMethod,
    });

    await donation.save();
    res.status(201).json({ message: "Donation recorded successfully", donation });

  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



//     await donation.save();
//     res.status(201).json({ message: "Donation recorded successfully", donation });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


/**
 * Get all donations for the logged-in user's NGO.
 * Only admin and staff can view all donations.
 */
const getAllDonations = async (req, res) => {
  console.log("User Role:", req.user.role);
  try {
    const ngoId = req.user.ngoId;
    if (!ngoId) {
      return res.status(400).json({ message: "User is not linked to any NGO" });
    }

    const donations = await Donation.find({ ngoId });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a donation by ID.
 */
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    // Ensure donation belongs to the user's NGO
    if (donation.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Donation does not belong to your NGO" });
    }
    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a donation (admin/staff only).
 */
const updateDonation = async (req, res) => {
  try {
    const { donorName, donorEmail, amount, paymentMethod } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    if (donation.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Donation does not belong to your NGO" });
    }

    if (donorName) donation.donorName = donorName;
    if (donorEmail) donation.donorEmail = donorEmail;
    if (amount) donation.amount = amount;
    if (paymentMethod) donation.paymentMethod = paymentMethod;

    await donation.save();
    res.status(200).json({ message: "Donation updated successfully", donation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a donation (admin only).
 */
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    if (donation.ngoId.toString() !== req.user.ngoId.toString()) {
      return res.status(403).json({ message: "Access denied: Donation does not belong to your NGO" });
    }
    await Donation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createDonation, getAllDonations, getDonationById, updateDonation, deleteDonation };
