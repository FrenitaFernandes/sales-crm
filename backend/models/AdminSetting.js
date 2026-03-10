const mongoose = require("mongoose");

const adminSettingSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: "default",
      unique: true,
      index: true,
    },
    company: {
      companyName: { type: String, default: "" },
      logo: { type: String, default: "" },
      addressLine1: { type: String, default: "" },
      addressLine2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
      gstNumber: { type: String, default: "" },
      taxLabel: { type: String, default: "GST" },
      taxPercent: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      dateFormat: { type: String, default: "DD/MM/YYYY" },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSetting", adminSettingSchema);
