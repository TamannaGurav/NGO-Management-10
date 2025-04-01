const Donation = require("../models/donationModel");

/**
 * Create a new donation.
 * This endpoint can be accessed by admin and staff.
 */
const createDonation = async (req, res) => {
  try {
    const { donorName, donorEmail, amount, paymentMethod } = req.body;
    const ngoId = req.user.ngoId; // Use the NGO ID from the logged-in user

    if (!ngoId) {
      return res.status(400).json({ message: "User is not linked to any NGO" });
    }

    const donation = new Donation({
      ngoId,
      donorName,
      donorEmail,
      amount,
      paymentMethod,
    });

    await donation.save();
    res.status(201).json({ message: "Donation recorded successfully", donation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all donations for the logged-in user's NGO.
 * Only admin and staff can view all donations.
 */
const getAllDonations = async (req, res) => {
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
