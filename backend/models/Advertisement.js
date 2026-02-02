const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
    },
    tagline: {
      type: String,
    },
    description: {
      type: String,
    },
    keywords: {
      type: String,
    },
    platform: {
      type: String,
    },
    type: {
      type: String,
    },
    targetArea: {
      type: String,
    },
    targetAudience: {
      type: String,
    },
    productLink: {
      type: String,
    },
    thumbnail: {
      type: String, // file path
    },
    budget: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'draft'],
      default: 'draft',
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Advertisement', advertisementSchema);
