const mongoose = require("mongoose");

const InvoiceItemSchema = new mongoose.Schema({
  description: String,
  qty: Number,
  unitPrice: Number,
  total: Number,
});

const InvoiceSchema = new mongoose.Schema(
  {
    customerName: String,
    invoiceNumber: String,
    invoiceDate: Date,
    items: [InvoiceItemSchema],
    grandTotal: Number,
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
