const Customer = require("../models/Customer");
const { logActivity } = require("../utils/activityLogger");


// ===========================
// CREATE CUSTOMER
// ===========================
exports.createCustomer = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      address,
      company,
      country,
      industryType
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name & Email are required"
      });
    }

    const exists = await Customer.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "Customer already exists"
      });
    }

    const customer = await Customer.create({
      userId: req.user._id,
      name,
      email,
      phone,
      address,
      company,
      country,
      industryType
    });

    await logActivity(
      req.user._id,
      req.user.name,
      "CREATE",
      "Customer",
      `Customer ${name} created`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      data: customer
    });

  } catch (error) {

    console.error("Create Customer Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// GET ALL CUSTOMERS
// ===========================
exports.getCustomers = async (req, res) => {
  try {

    const customers = await Customer
      .find({ isDeleted: false })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });

  } catch (error) {

    console.error("Get Customers Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// GET SINGLE CUSTOMER
// ===========================
exports.getCustomerById = async (req, res) => {
  try {

    const customer = await Customer.findById(req.params.id);

    if (!customer || customer.isDeleted) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {

    console.error("Get Customer Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// UPDATE CUSTOMER (ADMIN)
// ===========================
exports.updateCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    await logActivity(
      req.user._id,
      req.user.name,
      "UPDATE",
      "Customer",
      `Customer ${customer.name} updated`,
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer
    });

  } catch (error) {

    console.error("Update Customer Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// DELETE CUSTOMER
// ===========================
exports.deleteCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    await logActivity(
      req.user._id,
      req.user.name,
      "DELETE",
      "Customer",
      `Customer ${customer.name} deleted`,
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Customer removed successfully"
    });

  } catch (error) {

    console.error("Delete Customer Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



// ===========================
// UPDATE CUSTOMER PROFILE
// ===========================
exports.updateCustomerProfile = async (req, res) => {
  try {
    console.log("Update Profile Request:", { userId: req.user._id, email: req.user.email });

    let customer = await Customer.findOneAndUpdate(
      {
        $or: [
          { userId: req.user._id },
          { email: req.user.email }
        ],
        isDeleted: false
      },
      req.body,
      { new: true }
    );

    // If customer doesn't exist, create one
    if (!customer) {
      console.log("Customer not found, creating new profile...");
      customer = await Customer.create({
        userId: req.user._id,
        name: req.user.name || req.body.name || "",
        email: req.user.email,
        ...req.body,
        status: "Active"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      customer: customer
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message
    });
  }
};
// ===========================
// DELETE OWN ACCOUNT (CUSTOMER)
// ===========================
exports.deleteOwnAccount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // Try to find and update Customer by userId or email
    const customer = await Customer.findOneAndUpdate(
      { 
        $or: [
          { userId: userId },
          { email: userEmail }
        ]
      },
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    // Always mark User as inactive
    const User = require("../models/user");
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    await logActivity(
      userId,
      req.user.name || "Unknown",
      "DELETE",
      "Customer",
      `Customer ${customer?.name || req.user.name} deleted their own account`,
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {

    console.error("Delete Account Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// ===========================
// GET CUSTOMER DASHBOARD STATS
// ===========================
exports.getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get customer by userId or email
    const customer = await Customer.findOne({
      $or: [
        { userId: userId },
        { email: req.user.email }
      ]
    });

    if (!customer) {
      // Return default stats if customer record doesn't exist yet
      return res.status(200).json({
        invoiceCount: 0,
        notifications: 0,
        activeTickets: 0,
        profileCompletion: "0%"
      });
    }

    res.status(200).json({
      invoiceCount: 0,
      notifications: 0,
      activeTickets: 0,
      profileCompletion: "80%"
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      invoiceCount: 0,
      notifications: 0,
      activeTickets: 0,
      profileCompletion: "0%"
    });
  }
};