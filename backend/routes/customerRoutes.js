const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateCustomerProfile,
  deleteOwnAccount,
  getCustomerDashboard
} = require("../controllers/customerController");


// ===========================
// CUSTOMER PROFILE (Logged-in user)
// ===========================

// Get dashboard stats
router.get("/dashboard", protect, getCustomerDashboard);

// Update own profile (country, industryType, etc.)
router.put("/profile/update", protect, updateCustomerProfile);

// Delete own account (customer)
router.delete("/profile/delete", protect, deleteOwnAccount);

// Delete own account - alternative endpoint
router.delete("/delete-account", protect, deleteOwnAccount);

// ===========================
// ADMIN CUSTOMER MANAGEMENT
// ===========================

// Create new customer
router.post("/", protect, createCustomer);

// Get all customers
router.get("/", protect, getCustomers);

// Get single customer
router.get("/:id", protect, getCustomerById);

// Update customer by ID (admin)
router.put("/:id", protect, updateCustomer);

// Delete customer
router.delete("/:id", protect, deleteCustomer);


module.exports = router;