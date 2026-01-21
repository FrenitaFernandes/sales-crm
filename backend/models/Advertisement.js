const mongoose = require("mongoose");

const AdvertisementSchema = new mongoose.Schema(
  {
    title: String,
    platform: String,
    description: String,
    startDate: Date,
    endDate: Date,
    budget: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Advertisement", AdvertisementSchema);
