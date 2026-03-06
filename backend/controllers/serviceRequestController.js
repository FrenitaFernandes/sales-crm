const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");
const ChatMessage = require("../models/ChatMessage");

const getUserRole = (user) => String(user?.role || "").trim().toLowerCase();

const resolveCustomerByUser = async (user) => {
  if (!user) return null;

  const email = String(user.email || "").trim().toLowerCase();
  const name = String(user.name || "").trim();

  if (email) {
    const byEmail = await Customer.findOne({ email });
    if (byEmail) return byEmail;
  }

  if (name) {
    const byName = await Customer.findOne({ name });
    if (byName) return byName;
  }

  return null;
};

const hasRequestAccess = async (request, user) => {
  if (!request || !user) return false;
  if (getUserRole(user) === "admin") return true;

  const customer = await resolveCustomerByUser(user);
  if (!customer?._id) return false;

  return String(request.customerId) === String(customer._id);
};

// =============================
// CREATE SERVICE REQUEST
// =============================
exports.createServiceRequest = async (req, res) => {
  try {
    const { customerId, title, description, priority, subject, category } = req.body;

    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && req.user) {
      const userEmail = String(req.user.email || "").trim().toLowerCase();
      const userName = String(req.user.name || "").trim();

      let customerByIdentity = null;
      if (userEmail) {
        customerByIdentity = await Customer.findOne({ email: userEmail });
      }

      if (!customerByIdentity && userName) {
        customerByIdentity = await Customer.findOne({ name: userName });
      }

      if (!customerByIdentity && (userEmail || userName)) {
        customerByIdentity = await Customer.create({
          name: userName || "Customer",
          email: userEmail || undefined,
          status: "Active",
        });
      }

      if (customerByIdentity?._id) {
        resolvedCustomerId = customerByIdentity._id;
      }
    }

    const resolvedTitle = String(title || subject || "").trim();

    if (!resolvedCustomerId || !resolvedTitle) {
      return res.status(400).json({ message: "Customer ID & Title are required" });
    // Data comes from req.body (text) and req.file (image)
    const { customerId, subject, description, priority, category, enableChat } = req.body;

    if (!customerId || !subject) {
      return res.status(400).json({ message: "Customer ID & Subject are required" });
    }

    const customerExists = await Customer.findById(resolvedCustomerId);
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
<<<<<<< HEAD
      customerId: resolvedCustomerId,
      title: resolvedTitle,
      subject: String(subject || "").trim() || resolvedTitle,
      category: String(category || "").trim(),
=======
      ticketId,
      customerId,
      subject, // Uses 'subject' from your Model
>>>>>>> member3-preema
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

// =============================
// ENABLE CHAT FOR REQUEST (ADMIN)
// =============================
exports.allowServiceRequestChat = async (req, res) => {
  try {
    if (getUserRole(req.user) !== "admin") {
      return res.status(403).json({ message: "Only admin can allow chat" });
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { enableChat: true },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Chat enabled",
      data: request,
    });
  } catch (error) {
    console.error("Allow Chat Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET CHAT MESSAGES FOR REQUEST
// =============================
exports.getServiceRequestChat = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    const allowed = await hasRequestAccess(request, req.user);
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to access this chat" });
    }

    const messages = await ChatMessage.find({ serviceRequestId: request._id }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      chatEnabled: !!request.enableChat,
      data: messages,
    });
  } catch (error) {
    console.error("Get Chat Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =============================
// SEND CHAT MESSAGE FOR REQUEST
// =============================
exports.sendServiceRequestChatMessage = async (req, res) => {
  try {
    const messageText = String(req.body?.message || "").trim();
    if (!messageText) {
      return res.status(400).json({ message: "Message is required" });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    const allowed = await hasRequestAccess(request, req.user);
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to access this chat" });
    }

    if (!request.enableChat) {
      return res.status(403).json({ message: "Chat is not enabled yet" });
    }

    const message = await ChatMessage.create({
      serviceRequestId: request._id,
      senderRole: getUserRole(req.user) === "admin" ? "admin" : "customer",
      senderName: req.user.name || (getUserRole(req.user) === "admin" ? "Admin" : "Customer"),
      message: messageText,
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Send Chat Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};