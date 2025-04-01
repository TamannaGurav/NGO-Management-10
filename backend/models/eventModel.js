const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
    },
    description: String,
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
