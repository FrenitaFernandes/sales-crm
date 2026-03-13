const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");
const ChatMessage = require("../models/ChatMessage");
const MAX_CHAT_ATTACHMENT_SIZE = 8 * 1024 * 1024; // Keep below express 10mb payload limit.

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

  const requestCustomerId =
    request?.customerId && typeof request.customerId === "object"
      ? request.customerId._id
      : request?.customerId;

  return String(requestCustomerId || "") === String(customer._id);
};

const parseChatAttachment = (rawAttachment) => {
  if (!rawAttachment || typeof rawAttachment !== "object") return null;

  const name = String(rawAttachment.name || "").trim();
  const mimeType = String(rawAttachment.mimeType || "").trim();
  const dataUrl = String(rawAttachment.dataUrl || "").trim();
  if (!dataUrl) return null;

  if (!/^data:/i.test(dataUrl)) {
    throw new Error("Invalid attachment format");
  }

  if (Buffer.byteLength(dataUrl, "utf8") > MAX_CHAT_ATTACHMENT_SIZE) {
    throw new Error("Attachment is too large. Please upload a smaller file.");
  }

  return { name, mimeType, dataUrl };
};

const resolveChatSenderName = ({ message, customerName }) => {
  if (String(message?.senderRole || "").toLowerCase() === "admin") {
    return "Admin";
  }

  const fromMessage = String(message?.senderName || "").trim();
  return customerName || fromMessage || "Customer";
};

const resolveChatSenderRole = (message) => {
  const role = String(message?.senderRole || "").trim().toLowerCase();
  if (role === "admin" || role === "customer") return role;

  const name = String(message?.senderName || "").trim().toLowerCase();
  if (name === "admin") return "admin";
  return "customer";
};

const resolveChatMessageTime = (message) => {
  const sentAt = new Date(message?.sentAt || message?.createdAt || 0).getTime();
  return Number.isNaN(sentAt) ? 0 : sentAt;
};

const parseClientSentAt = (rawValue) => {
  const value = String(rawValue || "").trim();
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
};

// =============================
// CREATE SERVICE REQUEST
// =============================
exports.createServiceRequest = async (req, res) => {
  try {
    // Data comes from req.body (text) and req.file (image)
    const {
      customerId,
      title,
      description,
      priority,
      subject,
      category,
      enableChat,
      uploadedPreview,
      uploadedImage,
      attachment,
      file,
    } = req.body;

    let resolvedCustomerId = customerId;

    // If customerId not provided, find/create using logged-in user
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
      return res.status(400).json({
        message: "Customer ID & Title are required"
      });
    }

    const customerExists = await Customer.findById(resolvedCustomerId);

    if (!customerExists) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    const fileAttachment = req.file ? `/uploads/${req.file.filename}` : "";
    const resolvedAttachment = String(
      fileAttachment || uploadedPreview || uploadedImage || attachment || file || ""
    ).trim();

    const request = await ServiceRequest.create({
      customerId: resolvedCustomerId,
      title: resolvedTitle,
      subject: String(subject || "").trim() || resolvedTitle,
      category: String(category || "").trim(),
      description: String(description || "").trim(),
      priority: String(priority || "").trim() || "Medium",
      enableChat: enableChat === "true" || enableChat === true,
      uploadedImage: resolvedAttachment || undefined,
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
      return res.status(403).json({ message: "Only admin can update chat access" });
    }

    const enableChat = typeof req.body?.enableChat === "boolean" ? req.body.enableChat : true;

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { enableChat },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    return res.status(200).json({
      success: true,
      message: enableChat ? "Chat enabled" : "Chat disabled",
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
    const request = await ServiceRequest.findById(req.params.id).populate("customerId", "name");
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    const allowed = await hasRequestAccess(request, req.user);
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to access this chat" });
    }

    const messages = await ChatMessage.find({ serviceRequestId: request._id }).sort({ createdAt: 1, _id: 1 });
    const customerName = String(request?.customerId?.name || "").trim();
    const viewerRole = getUserRole(req.user) === "admin" ? "admin" : "customer";
    const data = messages
      .map((item) => {
      const message = item.toObject();
      const resolvedRole = resolveChatSenderRole(message);
      const isOwnMessage = resolvedRole === viewerRole;
      const displayName =
        viewerRole === "admin"
          ? (isOwnMessage ? "You" : (customerName || resolveChatSenderName({ message, customerName })))
          : (resolvedRole === "admin" ? "Admin" : "You");

      return {
        ...message,
        senderRole: resolvedRole,
        senderName: resolveChatSenderName({ message, customerName }),
        isOwnMessage,
        displayName,
      };
      })
      .sort((a, b) => {
        const timeDiff = resolveChatMessageTime(a) - resolveChatMessageTime(b);
        if (timeDiff !== 0) return timeDiff;

        const createdDiff =
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        if (createdDiff !== 0) return createdDiff;

        return String(a._id || "").localeCompare(String(b._id || ""));
      });

    return res.status(200).json({
      success: true,
      chatEnabled: !!request.enableChat,
      data,
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
    let attachment = null;
    try {
      attachment = parseChatAttachment(req.body?.attachment);
    } catch (attachmentError) {
      return res.status(400).json({ message: attachmentError.message || "Invalid attachment" });
    }

    if (!messageText && !attachment) {
      return res.status(400).json({ message: "Message or attachment is required" });
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

    const authenticatedRole = getUserRole(req.user) === "admin" ? "admin" : "customer";
    const senderContext = String(req.body?.senderContext || "").trim().toLowerCase();
    if (senderContext && senderContext !== authenticatedRole) {
      return res.status(403).json({ message: `Role mismatch. You are logged in as ${authenticatedRole}.` });
    }

    const isAdmin = authenticatedRole === "admin";
    const customer = isAdmin ? null : await resolveCustomerByUser(req.user);
    const clientSentAt = parseClientSentAt(req.body?.clientSentAt);
    const message = await ChatMessage.create({
      serviceRequestId: request._id,
      senderRole: authenticatedRole,
      senderName: isAdmin ? "Admin" : (customer?.name || req.user.name || "Customer"),
      message: messageText,
      sentAt: clientSentAt || new Date(),
      attachment: attachment || undefined,
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

// =============================
// ADMIN CHAT NOTIFICATIONS
// =============================
exports.getAdminChatNotifications = async (req, res) => {
  try {
    if (getUserRole(req.user) !== "admin") {
      return res.status(403).json({ message: "Only admin can access chat notifications" });
    }

    const sinceRaw = String(req.query?.since || "").trim();
    const sinceDate = sinceRaw ? new Date(sinceRaw) : new Date(0);
    const validSince = Number.isNaN(sinceDate.getTime()) ? new Date(0) : sinceDate;

    const messages = await ChatMessage.find({
      senderRole: "customer",
      createdAt: { $gt: validSince },
    })
      .sort({ createdAt: 1 })
      .limit(30)
      .populate({
        path: "serviceRequestId",
        select: "subject title customerId",
        populate: { path: "customerId", select: "name" },
      });

    const data = messages.map((msg) => ({
      _id: msg._id,
      serviceRequestId: msg.serviceRequestId?._id || null,
      customerName:
        msg.serviceRequestId?.customerId?.name ||
        msg.senderName ||
        "Customer",
      subject:
        msg.serviceRequestId?.subject ||
        msg.serviceRequestId?.title ||
        "Support Request",
      message: msg.message,
      attachmentName: msg.attachment?.name || "",
      createdAt: msg.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Admin Chat Notifications Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =============================
// CUSTOMER CHAT NOTIFICATIONS
// =============================
exports.getCustomerChatNotifications = async (req, res) => {
  try {
    if (getUserRole(req.user) !== "customer") {
      return res.status(403).json({ message: "Only customer can access chat notifications" });
    }

    const customer = await resolveCustomerByUser(req.user);
    if (!customer?._id) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const sinceRaw = String(req.query?.since || "").trim();
    const sinceDate = sinceRaw ? new Date(sinceRaw) : new Date(0);
    const validSince = Number.isNaN(sinceDate.getTime()) ? new Date(0) : sinceDate;

    const requestIds = await ServiceRequest.find({ customerId: customer._id }).distinct("_id");
    if (!requestIds.length) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const messages = await ChatMessage.find({
      serviceRequestId: { $in: requestIds },
      senderRole: "admin",
      createdAt: { $gt: validSince },
    })
      .sort({ createdAt: 1 })
      .limit(30)
      .populate({
        path: "serviceRequestId",
        select: "subject title",
      });

    const data = messages.map((msg) => ({
      _id: msg._id,
      serviceRequestId: msg.serviceRequestId?._id || null,
      subject:
        msg.serviceRequestId?.subject ||
        msg.serviceRequestId?.title ||
        "Support Request",
      message:
        String(msg.message || "").trim() ||
        (msg.attachment?.name
          ? `Admin sent an attachment: ${msg.attachment.name}`
          : "Admin sent an attachment"),
      attachmentName: msg.attachment?.name || "",
      createdAt: msg.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Customer Chat Notifications Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

