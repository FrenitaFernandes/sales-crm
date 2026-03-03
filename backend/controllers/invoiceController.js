const Invoice = require("../models/Invoice");

// =============================
// CREATE INVOICE
// =============================
exports.createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      tax,
      discount,
      total,
      invoiceDate,
      dueDate
    } = req.body;

    if (!invoiceNumber || !customerName || !subtotal || !total) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await Invoice.findOne({ invoiceNumber });
    if (exists) {
      return res.status(400).json({ message: "Invoice number already exists" });
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      tax,
      discount,
      total,
      invoiceDate,
      dueDate
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });

  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// GET ALL INVOICES
// =============================
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });

  } catch (error) {
    console.error("Get Invoices Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// GET SINGLE INVOICE
// =============================
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });

  } catch (error) {
    console.error("Get Invoice Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// UPDATE INVOICE
// =============================
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });

  } catch (error) {
    console.error("Update Invoice Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// UPDATE INVOICE STATUS
// =============================
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = status;
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice status updated",
      data: invoice,
    });

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// DELETE INVOICE
// =============================
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });

  } catch (error) {
    console.error("Delete Invoice Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};