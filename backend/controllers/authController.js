const User = require("../models/user");
const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mail");
const { sendWelcomeEmail, sendPasswordChangedEmail } = require("../services/emailService");

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
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user (customer only)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer",
    });

    // Create linked Customer entry so profile updates can resolve by userId.
    try {
      const customerData = {
        userId: user._id,
        name,
        email: normalizedEmail,
        phone,
        status: "Inactive",
      };
      await Customer.create(customerData);
    } catch (customerError) {
      // If Customer creation fails, delete the created User (rollback)
      console.error("Customer Creation Error Details:", customerError.message, customerError.errors);
      await User.deleteOne({ _id: user._id });
      return res.status(400).json({
        message: customerError.message || "Failed to create customer profile"
      });
    }

    res.status(201).json({
      message: "Registration successful!",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Send welcome email in background so signup never waits on SMTP.
    sendWelcomeEmail(normalizedEmail, name).catch((emailError) => {
      console.error("Email sending error:", emailError);
    });

  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    console.error("Registration Error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
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

// ===============================
// FORGOT PASSWORD (SEND OTP)
// ===============================
const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Password Reset",
        html: `
          <h2>Password Reset Request</h2>
          <p>Your OTP is: <b>${otp}</b></p>
          <p>This OTP will expire in 10 minutes.</p>
        `,
      });
    } catch (mailError) {
      console.error("Forgot Password Email Error:", mailError);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// VERIFY OTP
// ===============================
const verifyOTP = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const otp = String(req.body?.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (new Date(user.otpExpiry).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(user.otp) !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    return res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
const resetPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpiry || new Date(user.otpExpiry).getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    sendPasswordChangedEmail(email).catch((mailError) => {
      console.error("Password Changed Email Error:", mailError);
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
