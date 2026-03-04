const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createLead,
  getLeads,
  getCustomerLeads,
  getLeadById,
  updateLead,
  addFollowUp,
  updateStatus,
  deleteLead,
} = require("../controllers/leadController");

const router = express.Router();

router.post("/", protect, createLead);
router.get("/", protect, getLeads);
// customer-specific lookup must come before parameterized :id route
router.get("/customer/:email", protect, getCustomerLeads);
router.get("/:id", protect, getLeadById);
router.put("/:id", protect, updateLead);
router.post("/:id/followup", protect, addFollowUp);
router.put("/:id/status", protect, updateStatus);
router.delete("/:id", protect, deleteLead);

module.exports = router;