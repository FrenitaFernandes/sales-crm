const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user.js");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Ensure admin is present and active even if it already exists.
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      existingAdmin.name = existingAdmin.name || "Admin";
      existingAdmin.role = "admin";
      existingAdmin.isActive = true;
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();

      console.log("Admin user updated and activated");
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      process.exit(0);
    }

    // Create admin user
    await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin user created successfully");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
