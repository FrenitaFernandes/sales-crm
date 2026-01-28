const mongoose = require('mongoose');

const stockUsageSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  usedBy: {
    type: String,
    required: true
  },
  usageDate: {
    type: Date,
    default: Date.now
  },
  purpose: {
    type: String
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockUsage', stockUsageSchema);
