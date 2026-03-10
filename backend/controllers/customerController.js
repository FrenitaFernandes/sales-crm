const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");
const ServiceRequest = require("../models/ServiceRequest");
const Project = require("../models/Project");
const { logActivity } = require("../utils/activityLogger");

const formatTimeAgo = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
    [1, "second"],
  ];

  for (const [size, label] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) {
      return `${value} ${label}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

const calculateProfileCompletion = (customer) => {
  if (!customer) return 0;

  const checks = [
    Boolean(customer.name),
    Boolean(customer.email),
    Boolean(customer.phone),
    Boolean(customer.address),
    Boolean(customer.city),
    Boolean(customer.state),
    Boolean(customer.country),
    Boolean(customer.company),
    Boolean(customer.industryType),
    Array.isArray(customer.preferences) && customer.preferences.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};


// ===========================
// CREATE CUSTOMER
// ===========================
exports.createCustomer = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      address,
      company,
      country,
      industryType
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name & Email are required"
      });
    }

    const exists = await Customer.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "Customer already exists"
      });
    }

    const customer = await Customer.create({
      userId: req.user._id,
      name,
      email,
      phone,
      address,
      company,
      country,
      industryType
    });

    await logActivity(
      req.user._id,
      req.user.name,
      "CREATE",
      "Customer",
      `Customer ${name} created`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      data: customer
    });

  } catch (error) {

    console.error("Create Customer Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// GET ALL CUSTOMERS
// ===========================
exports.getCustomers = async (req, res) => {
  try {

    const customers = await Customer
      .find({ isDeleted: false })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });

  } catch (error) {

    console.error("Get Customers Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// GET SINGLE CUSTOMER
// ===========================
exports.getCustomerById = async (req, res) => {
  try {

    const customer = await Customer.findById(req.params.id);

    if (!customer || customer.isDeleted) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {

    console.error("Get Customer Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// UPDATE CUSTOMER (ADMIN)
// ===========================
exports.updateCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    await logActivity(
      req.user._id,
      req.user.name,
      "UPDATE",
      "Customer",
      `Customer ${customer.name} updated`,
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer
    });

  } catch (error) {

    console.error("Update Customer Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// DELETE CUSTOMER
// ===========================
exports.deleteCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    await logActivity(
      req.user._id,
      req.user.name,
      "DELETE",
      "Customer",
      `Customer ${customer.name} deleted`,
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Customer removed successfully"
    });

  } catch (error) {

    console.error("Delete Customer Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// UPDATE CUSTOMER PROFILE
// ===========================
exports.updateCustomerProfile = async (req, res) => {
  try {
    console.log("Update Profile Request:", { userId: req.user._id, email: req.user.email });

    let customer = await Customer.findOneAndUpdate(
      {
        $or: [
          { userId: req.user._id },
          { email: req.user.email }
        ],
        isDeleted: false
      },
      req.body,
      { new: true }
    );

    // If customer doesn't exist, create one
    if (!customer) {
      console.log("Customer not found, creating new profile...");
      const fallbackName =
        req.user?.name ||
        req.body?.name ||
        (req.user?.email ? req.user.email.split("@")[0] : "") ||
        "Customer";

      customer = await Customer.create({
        userId: req.user._id,
        name: fallbackName,
        email: req.user.email,
        ...req.body,
        status: "Active"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      customer: customer
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message
    });
  }
};
// ===========================
// DELETE OWN ACCOUNT (CUSTOMER)
// ===========================
exports.deleteOwnAccount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Try to find and update Customer by userId or email
    const customer = await Customer.findOneAndUpdate(
      { 
        $or: [
          { userId: userId },
          { email: userEmail }
        ]
      },
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    // Always mark User as inactive
    const User = require("../models/user");
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    await logActivity(
      userId,
      req.user.name || "Unknown",
      "DELETE",
      "Customer",
      `Customer ${customer?.name || req.user.name} deleted their own account`,
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {

    console.error("Delete Account Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// ===========================
// GET CUSTOMER DASHBOARD STATS
// ===========================
exports.getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = String(req.user.email || "").trim().toLowerCase();
    
    // Get customer by userId or email
    const customer = await Customer.findOne({
      $or: [
        { userId: userId },
        { email: userEmail }
      ],
      isDeleted: false,
    });

    if (!customer) {
      // Return default stats if customer record doesn't exist yet
      return res.status(200).json({
        invoiceCount: 0,
        notificationCount: 0,
        unreadNotifications: 0,
        activeTickets: 0,
        profileCompletion: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        projectCount: 0,
        salesOverview: [],
        recentActivity: [],
        recommendedMessage: "Check back later for relevant offers.",
      });
    }

    const customerId = customer._id;

    const [invoices, notifications, tickets, projects] = await Promise.all([
      Invoice.find({
        $or: [{ customerId }, { customerEmail: customer.email }],
      })
        .select("amount status invoiceNumber createdAt")
        .sort({ createdAt: -1 }),
      Notification.find({ customerId })
        .select("title message type read createdAt")
        .sort({ createdAt: -1 }),
      ServiceRequest.find({ customerId })
        .select("ticketId title status createdAt")
        .sort({ createdAt: -1 }),
      Project.find({ customerId })
        .select("projectName status createdAt")
        .sort({ createdAt: -1 }),
    ]);

    const invoiceCount = invoices.length;
    const notificationCount = notifications.length;
    const unreadNotifications = notifications.filter((n) => !n.read).length;
    const activeTickets = tickets.filter((t) => ["Pending", "Open", "In Progress"].includes(t.status)).length;
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const totalPaid = invoices
      .filter((inv) => String(inv.status || "").toLowerCase() === "paid")
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const profileCompletion = calculateProfileCompletion(customer);

    const monthMap = new Map();
    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
    const now = new Date();
    const monthlyRows = [];

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, {
        month: monthFormatter.format(d),
        invoiced: 0,
        paid: 0,
      });
    }

    invoices.forEach((inv) => {
      const createdAt = new Date(inv.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;

      const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) return;

      const row = monthMap.get(key);
      const amount = Number(inv.amount || 0);
      row.invoiced += amount;
      if (String(inv.status || "").toLowerCase() === "paid") {
        row.paid += amount;
      }
    });

    monthMap.forEach((value) => monthlyRows.push(value));

    const recentActivity = [];

    notifications.slice(0, 3).forEach((n) => {
      recentActivity.push({
        type: n.type || "system",
        title: n.title || "Notification",
        subtitle: n.message || "",
        timeAgo: formatTimeAgo(n.createdAt),
      });
    });

    tickets.slice(0, 2).forEach((t) => {
      recentActivity.push({
        type: "ticket",
        title: `Ticket ${t.ticketId || ""}`.trim(),
        subtitle: `${t.title || "Support request"} (${t.status || "Pending"})`,
        timeAgo: formatTimeAgo(t.createdAt),
      });
    });

    projects.slice(0, 2).forEach((p) => {
      recentActivity.push({
        type: "project",
        title: `Project ${p.projectName || ""}`.trim(),
        subtitle: `Status: ${p.status || "ongoing"}`,
        timeAgo: formatTimeAgo(p.createdAt),
      });
    });

    recentActivity.sort((a, b) => {
      const parseAgo = (txt) => {
        const m = String(txt || "").match(/^(\d+)\s+(\w+)/);
        if (!m) return Number.MAX_SAFE_INTEGER;
        const value = Number(m[1]);
        const unit = m[2].toLowerCase();
        const map = { second: 1, seconds: 1, minute: 60, minutes: 60, hour: 3600, hours: 3600, day: 86400, days: 86400, month: 2592000, months: 2592000, year: 31536000, years: 31536000 };
        return value * (map[unit] || 1);
      };
      return parseAgo(a.timeAgo) - parseAgo(b.timeAgo);
    });

    res.status(200).json({
      invoiceCount,
      notificationCount,
      unreadNotifications,
      activeTickets,
      profileCompletion,
      totalInvoiced,
      totalPaid,
      projectCount: projects.length,
      salesOverview: monthlyRows,
      recentActivity: recentActivity.slice(0, 6),
      recommendedMessage: "Check back later for relevant offers.",
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      invoiceCount: 0,
      notifications: 0,
      activeTickets: 0,
      profileCompletion: "0%"
    });
  }
};