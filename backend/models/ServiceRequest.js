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
<<<<<<< HEAD
      enum: ["Pending", "In Progress", "Completed", "Open", "Closed"],
      default: "Pending",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
=======
      enum: ["Open", "In Progress", "Closed"],
      default: "Open"
    }

>>>>>>> member3-preema
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);