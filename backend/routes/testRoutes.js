const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Test route: insert dummy user
router.get("/add-user", async (req, res) => {
  try {
    const newUser = await User.create({
      name: "Test User",
      email: "testuser@gmail.com",
      password: "123456",
      role: "customer",
    });

    res.json({
      message: "✅ Dummy user inserted",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error inserting user",
      error: error.message,
    });
  }
});

module.exports = router;
