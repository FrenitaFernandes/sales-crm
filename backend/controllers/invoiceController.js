const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const Project = require("../models/Project");
const Lead = require("../models/Lead");

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

const INVOICE_NUMBER_PATTERN = /^INV(\d{4,})$/i;

const formatInvoiceNumber = (sequenceNumber) => `INV${String(sequenceNumber).padStart(4, "0")}`;

const getHighestInvoiceSequence = async () => {
  const invoiceNumbers = await Invoice.find({}, { invoiceNumber: 1, _id: 0 }).lean();

  return invoiceNumbers.reduce((max, item) => {
    const match = String(item?.invoiceNumber || "").trim().match(INVOICE_NUMBER_PATTERN);
    if (!match) return max;

    const parsed = Number(match[1]);
    if (!Number.isInteger(parsed)) return max;

    return Math.max(max, parsed);
  }, 0);
};

const generateNextInvoiceNumber = async () => {
  const highestSequence = await getHighestInvoiceSequence();
  return formatInvoiceNumber(highestSequence + 1);
};

const resolveFallbackProjectName = async (invoice) => {
  const existingProjectName = String(invoice?.projectName || "").trim();
  if (existingProjectName) return existingProjectName;

  const customerEmail = String(invoice?.customerEmail || "").trim();
  const customerId = invoice?.customerId;

  if (customerEmail) {
    const latestProjectByEmail = await Project.findOne({ email: customerEmail })
      .collation({ locale: "en", strength: 2 })
      .sort({ createdAt: -1 })
      .select("projectName");
    const projectFromEmail = String(latestProjectByEmail?.projectName || "").trim();
    if (projectFromEmail) return projectFromEmail;

    const customerByEmail = await Customer.findOne({ email: customerEmail })
      .collation({ locale: "en", strength: 2 })
      .select("_id");

    if (customerByEmail?._id) {
      const latestProjectByCustomer = await Project.findOne({ customerId: customerByEmail._id })
        .sort({ createdAt: -1 })
        .select("projectName");
      const projectFromCustomer = String(latestProjectByCustomer?.projectName || "").trim();
      if (projectFromCustomer) return projectFromCustomer;
    }

    const latestLead = await Lead.findOne({ email: customerEmail })
      .collation({ locale: "en", strength: 2 })
      .sort({ createdAt: -1 })
      .select("projectName");
    const projectFromLead = String(latestLead?.projectName || "").trim();
    if (projectFromLead) return projectFromLead;
  }

  if (customerId) {
    const latestProjectByCustomerId = await Project.findOne({ customerId })
      .sort({ createdAt: -1 })
      .select("projectName");
    const projectFromCustomerId = String(latestProjectByCustomerId?.projectName || "").trim();
    if (projectFromCustomerId) return projectFromCustomerId;
  }

  return "";
};

const hydrateInvoiceProjectNames = async (invoices = []) => {
  return Promise.all(
    invoices.map(async (invoiceDoc) => {
      const fallbackProjectName = await resolveFallbackProjectName(invoiceDoc);
      const invoice = invoiceDoc.toObject ? invoiceDoc.toObject() : { ...invoiceDoc };

      return {
        ...invoice,
        projectName: fallbackProjectName || invoice.projectName || "",
      };
    })
  );
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
    const resolvedInvoiceNumber = trimmedInvoiceNumber || await generateNextInvoiceNumber();

    const missingFields = [];
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

    const exists = await Invoice.findOne({ invoiceNumber: resolvedInvoiceNumber });
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
      invoiceNumber: resolvedInvoiceNumber,
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
        title: `Invoice ${resolvedInvoiceNumber}`,
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
    const invoiceDocs = await Invoice.find().sort({ createdAt: -1 });
    const invoices = await hydrateInvoiceProjectNames(invoiceDocs);

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
    const invoiceDoc = await Invoice.findById(req.params.id);

    if (!invoiceDoc) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const [invoice] = await hydrateInvoiceProjectNames([invoiceDoc]);

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

    const invoiceDocs = await Invoice.find({ customerId }).sort({ createdAt: -1 });
    const invoices = await hydrateInvoiceProjectNames(invoiceDocs);

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
