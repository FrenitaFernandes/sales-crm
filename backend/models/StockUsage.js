<<<<<<< HEAD
const mongoose = require("mongoose");

const StockItemSchema = new mongoose.Schema({
  itemName: String,
  qtyUsed: Number,
  unitPrice: Number,
  total: Number,
});

const StockUsageSchema = new mongoose.Schema(
  {
    project: String,
    date: Date,
    items: [StockItemSchema],
    totalUsed: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockUsage", StockUsageSchema);
=======
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
>>>>>>> 5108e68322fc6824ea2f0a2abef728efcb2b9ff9
