const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

    ticketId: { type: String, trim: true },
    subject: { type: String, trim: true },
    category: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    enableChat: { type: Boolean, default: false },
    uploadedImage: { type: String },
    createdDate: { type: Date },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Open", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
