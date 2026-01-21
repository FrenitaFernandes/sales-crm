const mongoose = require("mongoose");

const StockItemSchema = new mongoose.Schema({
  itemName: String,
  qty: Number,
  unitPrice: Number,
  total: Number,
});

const StockEntrySchema = new mongoose.Schema(
  {
    supplierName: String,
    billNumber: String,
    date: Date,
    items: [StockItemSchema],
    grandTotal: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockEntry", StockEntrySchema);
