const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  addStockEntry,
  addStockUsage,
  getStockEntries,
  getStockUsage,
  getStockSummary,
} = require("../controllers/stockController");

const router = express.Router();

router.post("/entry", protect, addStockEntry);
router.post("/usage", protect, addStockUsage);

router.get("/entry", protect, getStockEntries);
router.get("/usage", protect, getStockUsage);

router.get("/summary", protect, getStockSummary);

module.exports = router;