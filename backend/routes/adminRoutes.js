const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { protect } = require("../middleware/authMiddleware");

const Customer = require("../models/Customer.js");
const ServiceRequest = require("../models/ServiceRequest.js");
const User = require("../models/user.js");
const Advertisement = require("../models/Advertisement.js");
const {
  createAdvertisement,
  getAdvertisements,
  deleteAdvertisement,
} = require("../controllers/advertisementController");

function buildTicketId() {
  return `TKT-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
}

function normalizeTicketId(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length >= 5) return `TKT-${digits.slice(-5)}`;
  if (digits.length > 0) return `TKT-${digits.padStart(5, "0")}`;
  return buildTicketId();
}

// GET: Dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();

    const totalServiceRequests = await ServiceRequest.countDocuments();
    const pendingRequests = await ServiceRequest.countDocuments({ status: "Pending" });
    const completedRequests = await ServiceRequest.countDocuments({ status: "Completed" });

    res.json({
      totalCustomers,
      totalServiceRequests,
      pendingRequests,
      completedRequests,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Seed/reset endpoint guarded to avoid accidental mass deletions.
router.post("/seed", protect, async (req, res) => {
  if (String(req.user?.role || "").toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Seeding disabled in production" });
  }

  if (String(process.env.SEED_ALLOW || "").toLowerCase() !== "true") {
    return res.status(403).json({ message: "Seeding disabled. Set SEED_ALLOW=true to enable." });
  }

  if (String(req.body?.confirm || "") !== "RESET_ALL") {
    return res.status(400).json({
      message: "Confirmation required. Send { \"confirm\": \"RESET_ALL\" } in request body."
    });
  }

  try {
    await Customer.deleteMany({});
    await ServiceRequest.deleteMany({});
    await User.deleteMany({}); // Clear existing users

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash("admin@123", 10);
    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedAdminPassword,
      role: "admin"
    });

    const customers = await Customer.insertMany([
      {
        name: "Preema",
        email: "preema@gmail.com",
        phone: "9999999999",
        status: "Active",
      },
      {
        name: "Alex",
        email: "alex@gmail.com",
        phone: "8888888888",
        status: "Inactive",
      },
    ]);

    await ServiceRequest.insertMany([
      {
        customerId: customers[0]._id,
        title: "Installation Issue",
        description: "Customer needs installation support",
        status: "Pending",
      },
      {
        customerId: customers[0]._id,
        title: "Payment Issue",
        description: "Payment failed, need help",
        status: "In Progress",
      },
      {
        customerId: customers[1]._id,
        title: "Product Demo",
        description: "Customer requesting demo",
        status: "Completed",
      },
    ]);

    res.json({ message: "Dummy data inserted successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ message: "Seed failed" });
  }
});

// ✅ Get all customers
router.get("/customers", async (req, res) => {
  try {
    const { registeredOnly } = req.query;

    let customers;
    if (String(registeredOnly).toLowerCase() === "true") {
      const registeredUsers = await User.find({ role: "customer" }).select("email");
      const registeredEmails = registeredUsers
        .map((u) => String(u.email || "").trim().toLowerCase())
        .filter(Boolean);

      customers = await Customer.find({ email: { $in: registeredEmails } }).sort({ createdAt: -1 });
    } else {
      customers = await Customer.find().sort({ createdAt: -1 });
    }

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get single customer by ID
router.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Get all service requests
router.get("/service-requests", async (req, res) => {
  try {
    const { status, search } = req.query;

    // basic filter object
    let filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    let requests = await ServiceRequest.find(filter)
      .populate("customerId", "name email phone status")
      .sort({ createdAt: -1 });

    // ✅ Search filter in server (optional but useful)
    if (search) {
      const s = search.toLowerCase();
      requests = requests.filter((r) => {
        const customerName = (r.customerId?.name || "").toLowerCase();
        const title = (r.title || "").toLowerCase();
        const email = (r.customerId?.email || "").toLowerCase();
        return customerName.includes(s) || title.includes(s) || email.includes(s);
      });
    }

    const normalized = requests.map((item) => {
      const doc = item?.toObject ? item.toObject() : item;
      const attachment =
        doc?.uploadedImage || doc?.uploadedPreview || doc?.attachment || doc?.file || null;

      return {
        ...doc,
        uploadedImage: attachment,
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error("Fetch service requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create new service request (supports file upload)
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Debug: list registered routes (temporary)
router.get('/routes-debug', (req, res) => {
  try {
    const routes = [];
    router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        const methods = Object.keys(r.route.methods).join(',');
        routes.push({ path: r.route.path, methods });
      }
    });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/service-requests", upload.single("attachment"), async (req, res) => {
  try {
    console.log('POST /service-requests called. hasFile=', !!req.file, 'bodyKeys=', Object.keys(req.body));
    const body = req.body || {};
    const { customerId, ticketId, subject, category, title, description, priority, status, enableChat, createdDate } = body;

    if (!customerId || !title) {
      return res.status(400).json({ message: "customerId and title are required" });
    }

    // map frontend status values if necessary
    let storeStatus = status;
    if (status === "Open") storeStatus = "Pending";
    if (status === "Closed") storeStatus = "Completed";

    const resolvedTicketId = normalizeTicketId(ticketId);

    let uploadedImageUrl = null;
    if (req.file) {
      uploadedImageUrl = `/uploads/${req.file.filename}`;
    }

    const newRequest = await ServiceRequest.create({
      customerId,
      ticketId: resolvedTicketId,
      subject,
      category,
      title,
      description,
      priority: priority || "Medium",
      status: storeStatus || "Pending",
      enableChat: enableChat === "true" || enableChat === true,
      uploadedImage: uploadedImageUrl,
      createdDate: createdDate ? new Date(createdDate) : new Date(),
    });

    const populated = await ServiceRequest.findById(newRequest._id).populate("customerId", "name email phone status");

    res.status(201).json({ message: "✅ Service request created", request: populated });
  } catch (err) {
    console.error("Create service request error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error" });
  }
});

// Fallback JSON create endpoint (no file) for quick testing
router.post("/service-requests-json", async (req, res) => {
  try {
    console.log('POST /service-requests-json called. bodyKeys=', Object.keys(req.body));
    const { customerId, ticketId, subject, category, title, description, priority, status, enableChat, createdDate } = req.body;

    if (!customerId || !title) {
      return res.status(400).json({ message: "customerId and title are required" });
    }

    let storeStatus = status;
    if (status === "Open") storeStatus = "Pending";
    if (status === "Closed") storeStatus = "Completed";

    const resolvedTicketId = normalizeTicketId(ticketId);

    const newRequest = await ServiceRequest.create({
      customerId,
      ticketId: resolvedTicketId,
      subject,
      category,
      title,
      description,
      priority: priority || "Medium",
      status: storeStatus || "Pending",
      enableChat: enableChat === true || enableChat === "true",
      uploadedImage: null,
      createdDate: createdDate ? new Date(createdDate) : new Date(),
    });

    const populated = await ServiceRequest.findById(newRequest._id).populate("customerId", "name email phone status");
    res.status(201).json({ message: "✅ Service request created (json)", request: populated });
  } catch (err) {
    console.error("Create service request (json) error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error" });
  }
});

// Simple JSON create endpoint that accepts base64 preview (no multer)
router.post("/service-requests-simple", async (req, res) => {
  try {
    console.log('POST /service-requests-simple called. bodyKeys=', Object.keys(req.body));
    const { customerId, ticketId, subject, category, title, description, priority, status, enableChat, createdDate, uploadedPreview } = req.body;

    if (!customerId || !title) {
      return res.status(400).json({ message: "customerId and title are required" });
    }

    let storeStatus = status;
    if (status === "Open") storeStatus = "Pending";
    if (status === "Closed") storeStatus = "Completed";

    const resolvedTicketId = normalizeTicketId(ticketId);

    const newRequest = await ServiceRequest.create({
      customerId,
      ticketId: resolvedTicketId,
      subject,
      category,
      title,
      description,
      priority: priority || "Medium",
      status: storeStatus || "Pending",
      enableChat: enableChat === true || enableChat === "true",
      uploadedImage: uploadedPreview || null,
      createdDate: createdDate ? new Date(createdDate) : new Date(),
    });

    const populated = await ServiceRequest.findById(newRequest._id).populate("customerId", "name email phone status");
    res.status(201).json({ message: "✅ Service request created (simple)", request: populated });
  } catch (err) {
    console.error("Create service request (simple) error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ Update status
router.put("/service-requests/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const updated = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("customerId", "name email phone status");

    if (!updated) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "✅ Status updated", request: updated });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete service request
router.delete("/service-requests/:id", async (req, res) => {
  try {
    const deleted = await ServiceRequest.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Service request not found" });
    }

    return res.json({ message: "✅ Service request deleted" });
  } catch (err) {
    console.error("Delete service request error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Latest 5 service requests (for dashboard table)
router.get("/recent-service-requests", async (req, res) => {
  try {
    const recent = await ServiceRequest.find()
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(recent);
  } catch (error) {
    console.error("Recent SR error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/dashboard/analytics", async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalServiceRequests = await ServiceRequest.countDocuments();

    const pendingRequests = await ServiceRequest.countDocuments({ status: "Pending" });
    const inProgressRequests = await ServiceRequest.countDocuments({ status: "In Progress" });
    const completedRequests = await ServiceRequest.countDocuments({ status: "Completed" });

    // ✅ trend: last 7 days
    const days = 7;
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - (days - 1));

    const trend = await ServiceRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: today },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalCustomers,
      totalServiceRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      trend,
    });
  } catch (err) {
    console.error("Dashboard analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------------------------
// SALES MODULE IMPORTS
// ---------------------------------------------
const StockEntry = require("../models/StockEntry");
const StockUsage = require("../models/StockUsage");
const Invoice = require("../models/Invoice");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const { createInvoice } = require("../controllers/invoiceController");


// -----------------------------------------------------
// STOCK ENTRY
// -----------------------------------------------------
router.post("/stock/entry", async (req, res) => {
  try {
    const entry = await StockEntry.create(req.body);
    res.json({ message: "Stock entry added", entry });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.get("/stock/entry", async (req, res) => {
  try {
    const entries = await StockEntry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.delete("/stock/entry/:id", async (req, res) => {
  try {
    const deleted = await StockEntry.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    res.json({ message: "Stock entry deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.delete("/stock/:id", async (req, res) => {
  try {
    const deleted = await StockEntry.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Stock entry not found" });
    }

    res.json({ message: "Stock entry deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});


// -----------------------------------------------------
// STOCK USAGE
// -----------------------------------------------------
router.post("/stock/usage", async (req, res) => {
  try {
    const usage = await StockUsage.create(req.body);
    res.json({ message: "Stock usage added", usage });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.get("/stock/usage", async (req, res) => {
  try {
    const usage = await StockUsage.find().sort({ createdAt: -1 });
    res.json(usage);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});


// -----------------------------------------------------
// STOCK SUMMARY
// -----------------------------------------------------
router.get("/stock/summary", async (req, res) => {
  try {
    const entry = await StockEntry.aggregate([{ $unwind: "$items" }]);
    const usage = await StockUsage.aggregate([{ $unwind: "$items" }]);

    const summary = {};

    entry.forEach((e) => {
      if (!summary[e.items.itemName]) summary[e.items.itemName] = 0;
      summary[e.items.itemName] += e.items.qty;
    });

    usage.forEach((u) => {
      if (!summary[u.items.itemName]) summary[u.items.itemName] = 0;
      summary[u.items.itemName] -= u.items.qtyUsed;
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});


// -----------------------------------------------------
// INVOICE
// -----------------------------------------------------
router.post("/invoice/new", async (req, res) => {
  return createInvoice(req, res);
});

router.get("/invoice/history", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.delete("/invoice/:id", async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});


// -----------------------------------------------------
// PROJECT
// -----------------------------------------------------
router.post("/project", async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.json({ message: "Project added", project });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.get("/project/ongoing", async (req, res) => {
  try {
    const data = await Project.find({ status: "Ongoing" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.get("/project/completed", async (req, res) => {
  try {
    const data = await Project.find({ status: "Completed" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});


// -----------------------------------------------------
// ADVERTISEMENT
// -----------------------------------------------------
router.post("/advertisement", async (req, res) => {
  return createAdvertisement(req, res);
});

router.get("/advertisement", async (req, res) => {
  return getAdvertisements(req, res);
});

router.delete("/advertisement/:id", async (req, res) => {
  return deleteAdvertisement(req, res);
});


// -----------------------------------------------------
// ACTIVITY LOGS
// -----------------------------------------------------
router.post("/activity/log", async (req, res) => {
  try {
    const log = await ActivityLog.create(req.body);
    res.json({ message: "Log saved", log });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.get("/activity/logs", async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

// -----------------------------------------------------
// UPDATE PROJECT (status, dates, title, etc.)
// -----------------------------------------------------
router.put("/project/:id", async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project updated successfully",
      project: updated,
    });
  } catch (err) {
    console.error("Project update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
