const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./utils/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.draft",
});


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).send("CRM Backend is running ✅");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
