const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createLead,
  getLeads,
  getTodayLeads,
  getCustomerLeads,
  getLeadById,
  updateLead,
  addFollowUp,
  updateStatus,
  deleteLead,
  checkCustomerByEmail,
  exportLeadsToPDF,
} = require("../controllers/leadController");

const router = express.Router();

// Check if customer exists by email (must come before other routes)
router.get("/check-customer", protect, checkCustomerByEmail);
router.post("/", protect, createLead);
router.get("/", protect, getLeads);
router.get("/today", protect, getTodayLeads);

// customer-specific lookup must come before parameterized :id route
router.get("/customer/:email", protect, getCustomerLeads);

// Export endpoints must come before parameterized routes
router.post("/export/pdf", protect, exportLeadsToPDF);

router.get("/:id", protect, getLeadById);
router.put("/:id", protect, updateLead);
router.post("/:id/followup", protect, addFollowUp);
router.put("/:id/status", protect, updateStatus);
router.delete("/:id", protect, deleteLead);

module.exports = router;