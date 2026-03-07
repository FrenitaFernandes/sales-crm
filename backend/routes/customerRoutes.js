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

// Get own profile data
router.get("/profile", protect, async (req, res) => {
  try {
    const Customer = require("../models/Customer");
    console.log("Fetching profile for userId:", req.user._id, "email:", req.user.email);
    
    let customer = await Customer.findOne({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
      isDeleted: false
    });
    
    // If customer doesn't exist, create one
    if (!customer) {
      console.log("Customer profile not found, creating new one...");
      customer = await Customer.create({
        userId: req.user._id,
        name: req.user.name || "",
        email: req.user.email,
        status: "Active"
      });
    }
    
    res.status(200).json({ success: true, customer });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

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