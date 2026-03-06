const User = require("../models/user");
const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../services/emailService");

// ===============================
// Generate JWT Token
// ===============================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ===============================
// REGISTER (CUSTOMER ONLY)
// ===============================
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user (customer only)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
    });
    // Create Customer entry
    await Customer.create({
      userId: user._id,
      name,
      email,
      phone,
      status: "Inactive",
    });

    // send welcome email
    await sendWelcomeEmail(email, name);

    res.status(201).json({
      message: "Registration successful! Welcome email sent.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ===============================
// LOGIN (ADMIN + CUSTOMER)
// ===============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};