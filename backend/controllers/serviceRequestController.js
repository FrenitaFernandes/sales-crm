const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");

// =============================
// CREATE SERVICE REQUEST
// =============================
exports.createServiceRequest = async (req, res) => {
  try {
    const { customerId, title, description, priority, category } = req.body;

    if (!customerId || !title) {
      return res.status(400).json({ message: "Customer ID & Title are required" });
    }

    const customerExists = await Customer.findById(customerId);
    if (!customerExists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 🔹 Generate Ticket ID
    const lastTicket = await ServiceRequest.findOne().sort({ createdAt: -1 });

    let ticketNumber = 2001;

    if (lastTicket && lastTicket.ticketId) {
      const lastNumber = parseInt(lastTicket.ticketId.split("-")[1]);
      ticketNumber = lastNumber + 1;
    }

    const ticketId = `TCK-${ticketNumber}`;

    const request = await ServiceRequest.create({
      ticketId,
      customerId,
      title,
      description,
      priority,
      category,
      status: "Open"
    });

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
    const request = await ServiceRequest.findById(req.params.id)
      .populate("customerId", "name email phone");

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