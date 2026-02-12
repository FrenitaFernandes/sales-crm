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
