const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Inactive",
    },
    company: String,
    industry: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);