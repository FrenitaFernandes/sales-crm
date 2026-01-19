const express = require("express");
const router = express.Router();

const Customer = require("./Customer");
const ServiceRequest = require("./ServiceRequest");

// ✅ Admin CRM Dashboard Stats
router.get("/crm/dashboard", async (req, res) => {
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
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
