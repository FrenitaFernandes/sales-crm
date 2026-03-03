require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const testRoutes = require("./routes/testRoutes");

const customerRoutes = require("./routes/customerRoutes");
const projectRoutes = require("./routes/projectRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const stockRoutes = require("./routes/stockRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const leadRoutes = require("./routes/leadRoutes");

// Initialize App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Main API Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);

// CRM Modules
app.use("/api/customers", customerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/services", serviceRequestRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/ads", advertisementRoutes);
app.use("/api/activity", activityLogRoutes);
app.use("/api/leads", leadRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).send("CRM Backend is running 🚀");
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));