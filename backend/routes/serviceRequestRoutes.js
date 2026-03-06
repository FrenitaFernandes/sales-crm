const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");

const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  updateServiceRequestStatus,
  deleteServiceRequest,
  allowServiceRequestChat,
  getServiceRequestChat,
  sendServiceRequestChatMessage,
} = require("../controllers/serviceRequestController");

const router = express.Router();

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists in your backend root
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
// ----------------------------

// Use upload.single("uploadedImage") to handle the file
router.post("/", protect, upload.single("uploadedImage"), createServiceRequest);

router.get("/", protect, getServiceRequests);
router.get("/customer/:customerId", protect, async (req, res) => {
  const ServiceRequest = require("../models/ServiceRequest");
  try {
    const requests = await ServiceRequest.find({
      customerId: req.params.customerId,
    })
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", protect, getServiceRequestById);
router.put("/:id", protect, updateServiceRequest);
router.put("/:id/status", protect, updateServiceRequestStatus);
router.put("/:id/allow-chat", protect, allowServiceRequestChat);
router.get("/:id/chat", protect, getServiceRequestChat);
router.post("/:id/chat", protect, sendServiceRequestChatMessage);
router.delete("/:id", protect, deleteServiceRequest);

module.exports = router;