const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const Project = require("../models/Project");

const normalizeStatus = (status) => {
  if (!status) return "pending";
  const normalized = String(status).trim().toLowerCase();
  const allowed = ["pending", "paid", "overdue", "cancelled"];
  return allowed.includes(normalized) ? normalized : "pending";
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return NaN;
  const cleaned = String(value).replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
};

// =============================
// CREATE INVOICE
// =============================
exports.createInvoice = async (req, res) => {
  try {
    const {
      customerId,
      invoiceNumber,
      customerName,
      projectName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      tax,
      discount,
      total,
      amount,
      description,
      date,
      status,
      invoiceDate,
      dueDate
    } = req.body;

    const trimmedInvoiceNumber = String(invoiceNumber || "").trim();
    const trimmedCustomerName = String(customerName || "").trim();

    const numericAmount = parseNumber(amount ?? total ?? subtotal);
    const taxValue = Number.isNaN(parseNumber(tax)) ? 0 : parseNumber(tax);
    const discountValue = Number.isNaN(parseNumber(discount)) ? 0 : parseNumber(discount);
    const subtotalValue = Number.isNaN(parseNumber(subtotal)) ? numericAmount : parseNumber(subtotal);
    const totalValue = Number.isNaN(parseNumber(total))
      ? numericAmount + taxValue - discountValue
      : parseNumber(total);

    const missingFields = [];
    if (!trimmedInvoiceNumber) missingFields.push("invoiceNumber");
    if (!trimmedCustomerName) missingFields.push("customerName");
    if (Number.isNaN(numericAmount)) missingFields.push("amount");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Required fields missing: ${missingFields.join(", ")}`,
      });
    }

    if (numericAmount < 0 || subtotalValue < 0 || totalValue < 0) {
      return res.status(400).json({ message: "Amount values cannot be negative" });
    }

    const exists = await Invoice.findOne({ invoiceNumber: trimmedInvoiceNumber });
    if (exists) {
      return res.status(400).json({ message: "Invoice number already exists" });
    }

    let resolvedCustomerId = customerId || null;
    let resolvedCustomerName = trimmedCustomerName;
    let resolvedCustomerEmail = customerEmail || "";
    let resolvedCustomerPhone = customerPhone || "";

    if (!resolvedCustomerId && resolvedCustomerEmail) {
      const matchedCustomer = await Customer.findOne({ email: resolvedCustomerEmail, isDeleted: false });
      if (matchedCustomer) {
        resolvedCustomerId = matchedCustomer._id;
        resolvedCustomerName = matchedCustomer.name || resolvedCustomerName;
        resolvedCustomerPhone = matchedCustomer.phone || resolvedCustomerPhone;
      }
    }

    let resolvedProjectName = String(projectName || "").trim();

    if (!resolvedProjectName) {
      const projectQuery = {};
      if (resolvedCustomerEmail) {
        projectQuery.email = resolvedCustomerEmail;
      } else if (resolvedCustomerId) {
        projectQuery.customerId = resolvedCustomerId;
      }

      if (Object.keys(projectQuery).length > 0) {
        const latestProject = await Project.findOne(projectQuery).sort({ createdAt: -1 });
        resolvedProjectName = latestProject?.projectName || "";
      }
    }

    const invoice = await Invoice.create({
      customerId: resolvedCustomerId,
      invoiceNumber: trimmedInvoiceNumber,
      customerName: resolvedCustomerName,
      projectName: resolvedProjectName,
      customerEmail: resolvedCustomerEmail,
      customerPhone: resolvedCustomerPhone,
      description: description || "",
      items,
      amount: numericAmount,
      subtotal: subtotalValue,
      tax: taxValue,
      discount: discountValue,
      total: totalValue,
      status: normalizeStatus(status),
      invoiceDate: invoiceDate || date,
      dueDate
    });

    if (resolvedCustomerId) {
      await Notification.create({
        customerId: resolvedCustomerId,
        title: `Invoice ${trimmedInvoiceNumber}`,
        message: `A new invoice has been generated for Rs.${numericAmount}.`,
        type: "order",
        read: false,
      });
    }

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

    invoice.status = normalizeStatus(status);
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice status updated",
      data: invoice,
    });

  } catch (error) {
    console.error("Status Update Error:", error);
    const message = error?.message || "Failed to update invoice status";
    res.status(400).json({ message });
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

// =============================
// GET INVOICES BY CUSTOMER
// =============================
exports.getInvoicesByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const invoices = await Invoice.find({ customerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });

  } catch (error) {
    console.error("Get Invoices By Customer Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};