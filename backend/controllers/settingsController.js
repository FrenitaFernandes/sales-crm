const bcrypt = require("bcryptjs");
const User = require("../models/user");
const AdminSetting = require("../models/AdminSetting");
const Customer = require("../models/Customer");
const Project = require("../models/Project");
const Invoice = require("../models/Invoice");

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Only admin can access settings" });
    return false;
  }
  return true;
};

const getOrCreateSettings = async () => {
  let settings = await AdminSetting.findOne({ singletonKey: "default" });
  if (!settings) {
    settings = await AdminSetting.create({ singletonKey: "default" });
  }
  return settings;
};

const toCsvValue = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
};

const makeCsv = (rows, headers) => {
  const lines = [headers.map(toCsvValue).join(",")];
  rows.forEach((row) => {
    const line = headers.map((key) => toCsvValue(row[key])).join(",");
    lines.push(line);
  });
  return lines.join("\n");
};

exports.getAdminSettings = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const settings = await getOrCreateSettings();
    return res.status(200).json({
      success: true,
      data: {
        profile: {
          name: req.user.name || "",
          email: req.user.email || "",
          phone: req.user.phone || "",
        },
        company: settings.company || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await User.findOne({ email });
    if (existing && String(existing._id) !== String(req.user._id)) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Data saved successfully",
      data: {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password must match" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateCompanySettings = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const settings = await getOrCreateSettings();
    const payload = req.body || {};

    settings.company = {
      ...settings.company?.toObject?.(),
      ...payload,
      taxPercent: Number(payload.taxPercent || 0),
    };
    settings.updatedBy = req.user._id;
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Data saved successfully",
      data: settings.company,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.exportCustomersCsv = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const customers = await Customer.find().sort({ createdAt: -1 }).lean();
    const rows = customers.map((c) => ({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      status: c.status || "",
      company: c.company || "",
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
    }));

    const csv = makeCsv(rows, ["name", "email", "phone", "status", "company", "createdAt"]);
    const filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.exportProjectsCsv = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const projects = await Project.find()
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const rows = projects.map((p) => ({
      projectName: p.projectName || "",
      customerName: p.customerId?.name || p.clientName || "",
      customerEmail: p.customerId?.email || p.email || "",
      phone: p.phone || "",
      status: p.status || "",
      endDate: p.endDate ? new Date(p.endDate).toISOString() : "",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
    }));

    const csv = makeCsv(rows, [
      "projectName",
      "customerName",
      "customerEmail",
      "phone",
      "status",
      "endDate",
      "createdAt",
    ]);
    const filename = `projects-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.exportInvoicesCsv = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const invoices = await Invoice.find().sort({ createdAt: -1 }).lean();
    const rows = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber || "",
      customerName: inv.customerName || "",
      customerEmail: inv.customerEmail || "",
      total: inv.total || inv.amount || 0,
      status: inv.status || "",
      invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString() : "",
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString() : "",
    }));

    const csv = makeCsv(rows, [
      "invoiceNumber",
      "customerName",
      "customerEmail",
      "total",
      "status",
      "invoiceDate",
      "dueDate",
    ]);
    const filename = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
