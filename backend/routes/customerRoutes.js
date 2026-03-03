const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();

// Protected routes
router.post("/", protect, createCustomer);
router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomerById);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);

module.exports = router;