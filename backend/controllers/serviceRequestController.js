const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");

// =============================
// CREATE SERVICE REQUEST
// =============================
exports.createServiceRequest = async (req, res) => {
  try {
    // Data comes from req.body (text) and req.file (image)
    const { customerId, subject, description, priority, category, enableChat } = req.body;

    if (!customerId || !subject) {
      return res.status(400).json({ message: "Customer ID & Subject are required" });
    }

    const customerExists = await Customer.findById(customerId);
    if (!customerExists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 🔹 Generate Ticket ID
    const lastTicket = await ServiceRequest.findOne().sort({ createdAt: -1 });
    let ticketNumber = 2001;
    if (lastTicket && lastTicket.ticketId) {
      const parts = lastTicket.ticketId.split("-");
      const lastNumber = parseInt(parts[1]);
      if (!isNaN(lastNumber)) {
        ticketNumber = lastNumber + 1;
      }
    }
    const ticketId = `TCK-${ticketNumber}`;

    // 🔹 Handle File Path
    // req.file is created by Multer in the routes file
    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const request = await ServiceRequest.create({
      ticketId,
      customerId,
      subject, // Uses 'subject' from your Model
      description,
      priority: priority || "Medium",
      category,
      enableChat: enableChat === "true" || enableChat === true, // handle string from FormData
      uploadedImage: imagePath,
      status: "Open",
    });

    // Requirement #1: Success response
    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      data: request,
    });
  } catch (error) {
    console.error("Create Service Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET ALL SERVICE REQUESTS
// =============================
exports.getServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Get Requests Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET SINGLE SERVICE REQUEST
// =============================
exports.getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate(
      "customerId",
      "name email phone"
    );

    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Get Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// UPDATE SERVICE REQUEST
// =============================
exports.updateServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service request updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Update Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// UPDATE STATUS ONLY
// =============================
exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      success: true,
      message: "Status updated",
      data: request,
    });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// DELETE SERVICE REQUEST
// =============================
exports.deleteServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service request deleted successfully",
    });
  } catch (error) {
    console.error("Delete Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};