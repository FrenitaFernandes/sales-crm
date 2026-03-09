const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["advertisement", "system", "order"],
    default: "system"
  },

  productLink: {
    type: String
  },

  image: {
    type: String
  },

  read: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Notification", notificationSchema);