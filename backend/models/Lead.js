const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    leadName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    projectName: { type: String, required: true },
    industryType: { type: String, required: true },
    
    // Legacy fields (keeping for backward compatibility)
    name: { type: String },
    project: { type: String },
    company: { type: String },
    description: { type: String },

    source: { type: String, default: "Unknown" },
    date: { type: Date, default: Date.now },

    status: {
  type: String,
  enum: [
    "New",
    "Contacted",
    "Interested",
    "In Progress",
    "Follow-Up",
    "Converted",
    "Lost",
    "Not Interested",
    "Dropout",
  ],
  default: "New",
},

    followUps: [
      {
        date: Date,
        note: String,
      }
    ],

    assignedTo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);