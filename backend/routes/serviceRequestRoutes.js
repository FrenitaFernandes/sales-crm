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

router.get("/customer/:customerId", protect, async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      customerId: req.params.customerId
    })
    .populate("customerId", "name email phone")
    .sort({ createdAt: -1 });

    res.json(requests);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;