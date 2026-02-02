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
    required: true
  },
  price: {
    type: Number,
    required: true
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
