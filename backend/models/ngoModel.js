const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "NGO name is required"],
      unique: true
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      unique: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending" // NGOs are pending by default until approved
    },
    adminName: {
        type: String,
        required: [true, "Admin name is required"],
      },
      adminEmail: {
        type: String,
        required: [true, "Admin email is required"],
      },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const NGO = mongoose.model("NGO", ngoSchema);
module.exports = NGO;
