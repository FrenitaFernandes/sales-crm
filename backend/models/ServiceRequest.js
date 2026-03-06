const mongoose = require("mongoose");

const PRIORITY_VALUES = ["Low", "Medium", "High"];
const STATUS_VALUES = ["Pending", "In Progress", "Completed", "Open", "Closed"];

const normalizePriority = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "low") return "Low";
  if (normalized === "high") return "High";
  return "Medium";
};

const normalizeStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "in progress") return "In Progress";
  if (normalized === "completed") return "Completed";
  if (normalized === "open") return "Open";
  if (normalized === "closed") return "Closed";
  return "Pending";
};

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    ticketId: {
      type: String,
      trim: true,
      unique: true,
      default: () => `TKT-${Date.now()}-${Math.floor(Math.random()*1000)}`
    },

    subject: {
      type: String,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    enableChat: {
      type: Boolean,
      default: false,
    },

    uploadedImage: {
      type: String,
    },

    priority: {
      type: String,
      enum: PRIORITY_VALUES,
      set: normalizePriority,
      default: "Medium",
    },

    status: {
      type: String,
      enum: STATUS_VALUES,
      set: normalizeStatus,
      default: "Pending",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
