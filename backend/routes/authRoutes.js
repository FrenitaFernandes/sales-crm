
/*
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
*/
const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;