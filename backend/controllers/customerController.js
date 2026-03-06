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
      .find()
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

    if (!customer) {
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

    const customer = await Customer.findByIdAndDelete(req.params.id);

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

    const customer = await Customer.findOneAndUpdate(
      {
        $or: [
          { userId: req.user._id },
          { email: req.user.email }
        ]
      },
      req.body,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: customer
    });

  } catch (error) {

    console.error("Update Profile Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};