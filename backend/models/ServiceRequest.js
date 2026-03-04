const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    ticketId: {
      type: String,
      trim: true,
      unique: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    enableChat: {
      type: Boolean,
      default: false
    },

    uploadedImage: {
      type: String
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open"
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);