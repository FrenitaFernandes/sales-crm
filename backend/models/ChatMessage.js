const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    serviceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["admin", "customer"],
      required: true,
    },
    senderName: {
      type: String,
      trim: true,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    attachment: {
      name: { type: String, trim: true, default: "" },
      mimeType: { type: String, trim: true, default: "" },
      dataUrl: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
