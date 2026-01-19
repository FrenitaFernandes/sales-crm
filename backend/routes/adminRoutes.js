const express = require("express");
const router = express.Router();

const Customer = require("../models/Customer");
const ServiceRequest = require("../models/ServiceRequest");

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

module.exports = router;
