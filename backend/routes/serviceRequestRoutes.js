const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  updateServiceRequestStatus,
  deleteServiceRequest,
} = require("../controllers/serviceRequestController");

const router = express.Router();

router.post("/", protect, createServiceRequest);
router.get("/", protect, getServiceRequests);
router.get("/:id", protect, getServiceRequestById);
router.put("/:id", protect, updateServiceRequest);
router.put("/:id/status", protect, updateServiceRequestStatus);
router.delete("/:id", protect, deleteServiceRequest);

module.exports = router;