const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getCustomerLeads } = require("../controllers/leadController");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  addFollowUp,
  updateStatus,
  deleteLead,
} = require("../controllers/leadController");

const router = express.Router();

router.post("/", protect, createLead);
router.get("/", protect, getLeads);
router.get("/:id", protect, getLeadById);
router.put("/:id", protect, updateLead);
router.post("/:id/followup", protect, addFollowUp);
router.put("/:id/status", protect, updateStatus);
router.delete("/:id", protect, deleteLead);
router.get("/customer/:email", protect, getCustomerLeads);

module.exports = router;