const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },
    donorName: {
      type: String,
      required: [true, "Donor name is required"],
    },
    donorEmail: {
      type: String,
      required: [true, "Donor email is required"],
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank transfer", "credit card"],
      required: [true, "Payment method is required"],
      lowercase: true,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);
module.exports = Donation;
