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
    const User = require("../models/user");
    const userId = req.user?._id || req.user?.id;
    const userEmail = String(req.user?.email || "").trim().toLowerCase();

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized user context" });
    }

    console.log("Fetching profile for userId:", userId, "email:", userEmail);

    const orFilters = [];
    if (userId) orFilters.push({ userId });
    if (userEmail) orFilters.push({ email: userEmail });

    let customer = await Customer.findOne({
      $or: orFilters,
      isDeleted: false
    });

    // Reuse an existing record (even if soft-deleted) to avoid duplicate email errors.
    if (!customer) {
      const existingCustomer = await Customer.findOne({ $or: orFilters });

      if (existingCustomer) {
        customer = existingCustomer;
      }
    }

    // If customer still doesn't exist, create one
    if (!customer) {
      console.log("Customer profile not found, creating new one...");
      const fallbackName =
        req.user?.name ||
        (userEmail ? userEmail.split("@")[0] : "") ||
        "Customer";

      let resolvedUserId = userId;
      if (!resolvedUserId && userEmail) {
        const matchedUser = await User.findOne({ email: userEmail }).select("_id");
        resolvedUserId = matchedUser?._id || null;
      }

      if (!resolvedUserId) {
        return res.status(400).json({ success: false, message: "Unable to resolve user profile." });
      }

      customer = await Customer.create({
        userId: resolvedUserId,
        name: fallbackName,
        email: userEmail,
        phone: req.user?.phone || "",
        status: "Active"
      });
    }

    if (!customer.phone && req.user?.phone) {
      customer.phone = req.user.phone;
      try {
        await customer.save();
      } catch (saveError) {
        // If legacy duplicate emails exist, avoid failing profile load.
        console.warn("Profile phone sync skipped:", saveError?.message || saveError);
      }
    }

    const payload = {
      ...customer.toObject(),
      phone: customer.phone || req.user?.phone || "",
      memberSince: customer.createdAt || req.user.createdAt || null
    };

    res.status(200).json({ success: true, customer: payload, data: payload });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// Update own profile (country, industryType, etc.)
router.put("/profile/update", protect, updateCustomerProfile);
router.put("/profile", protect, updateCustomerProfile);

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