const Donation = require("../models/donationModel");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

/**
 * Sends a thank-you email to the donor after a successful donation.
 */
const sendThankYouEmail = async (donorEmail, donorName, amount) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: donorEmail,
      subject: "Thank You for Your Donation!",
      text: `Dear ${donorName},\n\nThank you for your generous donation of ₹${amount}. Your support helps us continue our mission!\n\nBest regards,\n[Your NGO Name]`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Thank You email sent to: ${donorEmail}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${donorEmail}:`, error.message);
  }
};

/**
 * Creates a new donation and sends a thank-you email.
 * Only accessible by admins and staff.
 */
const createDonation = async (req, res) => {
  console.log("📩 Received Donation Data:", req.body);

  try {
    const { donorName, donorEmail, amount, paymentMethod } = req.body;
    const ngoId = req.user.ngoId;

    if (!donorName || !donorEmail || !amount || !ngoId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate NGO ID
    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ message: "Invalid NGO ID format" });
    }

    // Ensure amount is a valid positive number
    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ message: "Amount must be a valid positive number" });
    }

    // Create and save donation
    const donation = await Donation.create({
      ngoId: new mongoose.Types.ObjectId(ngoId),
      donorName,
      donorEmail,
      amount: amountNumber,
      paymentMethod,
    });

    // Send thank-you email asynchronously
    if (donorEmail) {
      await sendThankYouEmail(donorEmail, donorName, amountNumber);
    }

    res.status(201).json({ message: "Donation recorded successfully", donation });

  } catch (error) {
    console.error("❌ Error creating donation:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieves all donations for the logged-in user's NGO.
 * Only accessible by admins and staff.
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
    console.error("❌ Error fetching donations:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieves a single donation by ID.
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
    console.error("❌ Error fetching donation:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Updates a donation (admin/staff only).
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
    if (amount) {
      const amountNumber = Number(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({ message: "Amount must be a valid positive number" });
      }
      donation.amount = amountNumber;
    }
    if (paymentMethod) donation.paymentMethod = paymentMethod;

    await donation.save();
    res.status(200).json({ message: "Donation updated successfully", donation });
  } catch (error) {
    console.error("❌ Error updating donation:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Deletes a donation (admin only).
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
    console.error("❌ Error deleting donation:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createDonation, getAllDonations, getDonationById, updateDonation, deleteDonation };
