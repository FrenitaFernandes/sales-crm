require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const testRoutes = require("./routes/testRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const customerRoutes = require("./routes/customerRoutes");
const projectRoutes = require("./routes/projectRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const stockRoutes = require("./routes/stockRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const leadRoutes = require("./routes/leadRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Initialize App
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.use("/api/customer", notificationRoutes);
app.use("/api/settings", settingsRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).send("CRM Backend is running 🚀");
});

// Return JSON for oversized payloads and other body parse errors.
app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ message: "Attachment is too large. Please upload a smaller file." });
  }

  if (err) {
    return res.status(400).json({ message: "Invalid request payload" });
  }

  return next();
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
