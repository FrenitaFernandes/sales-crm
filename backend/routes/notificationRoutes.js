const express = require("express");
const router = express.Router();

const {
  getCustomerNotifications,
  markNotificationRead
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const {
  getCustomerDashboard
} = require("../controllers/customerController");


// GET dashboard stats
router.get("/dashboard", protect, getCustomerDashboard);

// GET notifications
router.get(
  "/notifications",
  protect,
  getCustomerNotifications
);


// MARK READ
router.put(
  "/notifications/:id/read",
  protect,
  markNotificationRead
);

module.exports = router;