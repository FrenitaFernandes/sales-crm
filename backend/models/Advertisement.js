const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },
    productName: {
      type: String,
      default: ""
    },
    tagline: {
      type: String
    },
    description: {
      type: String
    },
    type: {
      type: String
    },
    targetArea: {
      type: String
    },
    targetAudience: {
      type: String
    },
    thumbnail: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Advertisement', advertisementSchema);
