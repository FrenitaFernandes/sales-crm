const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  getActivityLogs,
  getActivityLogById,
  deleteActivityLog,
  clearActivityLogs
} = require("../controllers/activityLogController");

const router = express.Router();

router.get("/", protect, getActivityLogs);
router.get("/:id", protect, getActivityLogById);
router.delete("/:id", protect, deleteActivityLog);
router.delete("/", protect, clearActivityLogs);

module.exports = router;