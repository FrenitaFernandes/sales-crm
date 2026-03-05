const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  addStockEntry,
  addStockUsage,
  getStockEntries,
  getStockUsage,
  getStockSummary,
  updateStockEntry,
  deleteStockEntry,
} = require("../controllers/stockController");

const router = express.Router();

router.post("/entry", protect, addStockEntry);
router.post("/usage", protect, addStockUsage);

router.get("/entry", protect, getStockEntries);
router.get("/usage", protect, getStockUsage);
router.put("/entry/:id", protect, updateStockEntry);
router.delete("/entry", protect, deleteStockEntry);
router.delete("/entry/:id", protect, deleteStockEntry);
router.delete("/:id", protect, deleteStockEntry);

router.get("/summary", protect, getStockSummary);

module.exports = router;