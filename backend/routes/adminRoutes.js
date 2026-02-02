const express = require("express");
const router = express.Router();

const Customer = require("../models/Customer.js");
const ServiceRequest = require("../models/ServiceRequest.js");

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


// ✅ Seed Dummy Data (ONLY FOR DRAFT DB)
router.get("/seed", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
  return res.status(403).json({ message: "❌ Seeding disabled in production" });
}

  try {
    await Customer.deleteMany({});
    await ServiceRequest.deleteMany({});

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

    res.json({ message: "✅ Dummy data inserted successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ message: "Seed failed" });
  }
});

// ✅ Get all customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
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

router.get("/service-requests", async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Fetch service requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/service-requests", async (req, res) => {
  try {
    const { customerId, title, description } = req.body;

    if (!customerId || !title) {
      return res.status(400).json({ message: "customerId and title are required" });
    }

    const newRequest = await ServiceRequest.create({
      customerId,
      title,
      description,
      status: "Pending",
    });

    res.status(201).json({ message: "✅ Service request created", request: newRequest });
  } catch (err) {
    console.error("Create service request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/service-requests/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });

    const updated = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "✅ Status updated", request: updated });
  } catch (err) {
    console.error("Update status error:", err);
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

    res.json(requests);
  } catch (err) {
    console.error("Fetch service requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create new service request
router.post("/service-requests", async (req, res) => {
  try {
    const { customerId, title, description, priority } = req.body;

    if (!customerId || !title) {
      return res.status(400).json({ message: "customerId and title are required" });
    }

    const newRequest = await ServiceRequest.create({
      customerId,
      title,
      description,
      priority: priority || "Medium",
      status: "Pending",
    });

    res.status(201).json({ message: "✅ Service request created", request: newRequest });
  } catch (err) {
    console.error("Create service request error:", err);
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
const Advertisement = require("../models/Advertisement");
const ActivityLog = require("../models/ActivityLog");


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
  try {
    const invoice = await Invoice.create(req.body);
    res.json({ message: "Invoice created", invoice });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
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
  try {
    const adv = await Advertisement.create(req.body);
    res.json({ message: "Ad created", adv });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
});

router.get("/advertisement", async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err });
  }
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
