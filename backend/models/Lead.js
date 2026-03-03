const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },

    source: { type: String, default: "Unknown" },

    status: {
      type: String,
      enum: ["New", "Contacted", "In Progress", "Follow-Up", "Converted", "Lost"],
      default: "New",
    },

    followUps: [
      {
        date: Date,
        note: String,
      }
    ],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);