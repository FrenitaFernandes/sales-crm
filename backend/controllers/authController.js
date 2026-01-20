const User = require("../models/user"); 
const bcrypt = require("bcryptjs");
const { sendOTP } = require("../services/emailService");

// ===============================
// REGISTER (CUSTOMER ONLY + OTP)
// ===============================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expiry (5 mins)
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // create CUSTOMER only
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer", // 🔒 fixed rule
      otp,
      otpExpiry,
    });

    // send OTP email
    await sendOTP(email, otp);

    res.status(201).json({
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // admin / customer
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
