/*

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
  // Create linked Customer entry so profile updates can resolve by userId.
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
*/
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../services/emailService");
const transporter = require("../config/mail");
const { sendPasswordChangedEmail } = require("../services/emailService");
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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isActive === false) {
        // reactivate previously deleted/inactive account
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.isActive = true;
        await existingUser.save();

        // update or recreate customer record
        const Customer = require("../models/Customer");
        await Customer.findOneAndUpdate(
          { userId: existingUser._id },
          {
            isDeleted: false,
            deletedAt: null,
            name,
            email,
            phone,
          },
          { upsert: true, new: true }
        );

        await sendWelcomeEmail(email, name);
        return res.status(200).json({
          message: "Account reactivated. Welcome back!",
          token: generateToken(existingUser._id),
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          },
        });
      }

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
      phone
    });

    // CREATE CUSTOMER RECORD (with timestamps - createdAt will be auto-set)
    const Customer = require("../models/Customer");
    await Customer.create({
      userId: user._id,
      name,
      email,
      phone,
      status: "Inactive"
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
      return res
        .status(400)
        .json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // don't allow login when marked inactive (deleted)
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account inactive. Please register again." });
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

// ===============================
// FORGOT PASSWORD (Send OTP)
// ===============================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP + Expiry (10 minutes)
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP to reset the password is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ===============================
// VERIFY OTP
// ===============================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password
    user.password = hashedPassword;

    // clear OTP fields
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // send email notification
    await sendPasswordChangedEmail(email);

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
module.exports = {
  registerUser,
  loginUser,
  forgotPassword, // ⬅ added export
  verifyOTP,   // ✅ add this
  resetPassword// ✅ add this
};