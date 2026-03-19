const bcrypt = require("bcryptjs");
const User = require("../models/user");

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123";

const ensureDefaultAdmin = async () => {
  const email = String(DEFAULT_ADMIN_EMAIL || "").trim().toLowerCase();
  if (!email) return;

  const hashedPassword = await bcrypt.hash(String(DEFAULT_ADMIN_PASSWORD || "admin@123"), 10);

  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: "Admin",
        role: "admin",
        isActive: true,
        password: hashedPassword,
      },
      $setOnInsert: {
        email,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

module.exports = { ensureDefaultAdmin };
