const mongoose = require('mongoose');

const stockEntrySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: "Nos"
  },
  price: {
    type: Number,
    required: true
  },
  billNumber: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: "None"
  },
  supplier: {
    type: String
  },
  entryDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockEntry', stockEntrySchema);
