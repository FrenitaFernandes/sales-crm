const mongoose = require("mongoose");
const Project = require("../models/Project");
const Customer = require("../models/Customer");

const parseFlexibleDate = (value) => {
  if (!value) return null;
  const raw = String(value).trim();

  // Support dd-mm-yyyy.
  const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    const parsed = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};


// =============================
// GET MY PROJECTS (CUSTOMER)
// =============================
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = String(req.user?.email || "").trim();

    // Strictly bind projects to the logged-in user's customer profile.
    // Prefer userId linkage, fallback to exact email only to locate that profile.
    const customer = await Customer.findOne({
      $or: [
        ...(userId ? [{ userId }] : []),
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
      isDeleted: false,
    }).select("_id");

    if (!customer?._id) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const projects = await Project.find({ customerId: customer._id })
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });

    const payload = projects.map((project) => {
      const obj = project.toObject();
      return {
        ...obj,
        phone: obj.phone || obj.customerId?.phone || "",
      };
    });

    res.status(200).json({
      success: true,
      count: payload.length,
      data: payload,
    });
  } catch (error) {
    console.error("Get My Projects Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// CREATE PROJECT
// =============================
exports.createProject = async (req, res) => {
  console.log("[projectController] createProject body:", req.body);
  console.log("[projectController] req.user:", req.user);

  try {

    let {
      customerId,
      customerName,
      projectName,
      clientName,
      email,
      description,
      customizationDetails,
      status,
      startDate,
      endDate,
      budget,
      assignedTo,
      progress,
      dueDate,
      phone
    } = req.body;

    // map dueDate → endDate
    if (dueDate && !endDate) {
      endDate = dueDate;
    }

    const authUserId = req.user?._id || null;
    const tokenUserEmail = String(req.user?.email || "").trim().toLowerCase();

    if (!authUserId) {
      return res.status(401).json({ message: "Unauthorized user context" });
    }

    // map customizationDetails → description
    if (customizationDetails && !description) {
      description = customizationDetails;
    }

    const normalizedEndDate = parseFlexibleDate(endDate || dueDate);
    if ((endDate || dueDate) && !normalizedEndDate) {
      return res.status(400).json({ message: "Invalid due date format. Use yyyy-mm-dd." });
    }

    if (!projectName) {
      return res.status(400).json({ message: "Project Name is required" });
    }

    // =============================
    // FIND OR CREATE CUSTOMER
    // =============================
    // For customer users, always bind project to their own profile.
    if (req.user?.role === "customer") {
      const userEmail = String(req.user?.email || "").trim().toLowerCase();

      let customer = await Customer.findOne({
        $or: [
          ...(req.user?._id ? [{ userId: req.user._id }] : []),
          ...(userEmail ? [{ email: userEmail }] : []),
        ],
      }).sort({ createdAt: -1 });

      if (!customer) {
        customer = await Customer.create({
          userId: authUserId,
          name: customerName || req.user?.name || "Customer",
          email: userEmail,
          phone: phone || req.user?.phone,
          status: "Active",
        });
      }

      customerId = customer._id;
      email = customer.email || userEmail;
      customerName = customer.name || customerName;

      if (!customer.userId) {
        customer.userId = authUserId;
      }

      if (phone && customer.phone !== phone) {
        customer.phone = phone;
        if (customer.userId) {
          await customer.save();
        }
      }
    }

    if (!customerId) {
      const role = String(req.user?.role || "").toLowerCase();
      const userEmail = String(req.user?.email || "").trim().toLowerCase();

      let customer = null;
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const generatedEmail = customerName
        ? `${String(customerName).toLowerCase().replace(/\s+/g, ".")}@placeholder.com`
        : "customer@placeholder.com";

      // Try finding by email first.
      if (normalizedEmail) {
        customer = await Customer.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
      }

      // Fallback to name match when email is not provided.
      if (!customer && customerName) {
        customer = await Customer.findOne({ name: customerName }).sort({ createdAt: -1 });
      }

      // If not found, create new customer.
      if (!customer) {
        customer = await Customer.create({
          userId: authUserId,
          name: customerName || req.user?.name || "Customer",
          email: normalizedEmail || userEmail || tokenUserEmail || generatedEmail,
          phone: phone || req.user?.phone,
          status: "Active",
        });
      }

      // Update phone if changed.
      if (phone && customer.phone !== phone) {
        customer.phone = phone;
        if (!customer.userId) {
          customer.userId = authUserId;
        }
        await customer.save();
      }

      customerId = customer._id;
    }

    if (!customerId) {
      return res.status(400).json({ message: "Customer information is required" });
    }

    // set default clientName
    if (!clientName) {
      clientName = customerName || (req.user && req.user.name);
    }

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("[projectController] About to create project with:", {
      customerId,
      projectName,
      clientName,
      email,
      description,
      phone,
      status,
      endDate
    });

    // =============================
    // CREATE PROJECT
    // =============================
    const project = await Project.create({
      customerId,
      projectName,
      clientName,
      email: email.toLowerCase(),
      description,
      phone,
      status: status || "ongoing",
      startDate: startDate || Date.now(),
      endDate: normalizedEndDate || undefined,
      budget,
      assignedTo,
      progress: progress || 0
    });

    // populate customer info
    const populatedProject = await project.populate(
      "customerId",
      "name email company phone"
    );

    console.log(
      "[projectController] createProject -> project.phone:",
      project.phone
    );

    console.log(
      "[projectController] createProject -> customer.phone:",
      populatedProject.customerId?.phone
    );

    let resp;
    try {
      resp = populatedProject.toObject();
    } catch {
      resp = populatedProject;
    }

    resp.phone = resp.phone || resp.customerId?.phone || null;

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: resp
    });

    console.log("[projectController] Project created successfully:", project._id);

  } catch (error) {
    console.error("[projectController] Create Project Error:", error.message);
    console.error("[projectController] Full Error:", error);

    // Check if it's a validation error.
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: messages.join(", ")
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// =============================
// GET ALL PROJECTS
// =============================
exports.getProjects = async (req, res) => {
  try {

    const projects = await Project.find()
      .populate("customerId", "name email company phone")
      .sort({ createdAt: -1 });

    const payload = projects.map(p => {
      const obj = p.toObject();
      obj.phone = obj.phone || obj.customerId?.phone || null;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: payload.length,
      data: payload
    });

  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// GET SINGLE PROJECT
// =============================
exports.getProjectById = async (req, res) => {
  try {

    const project = await Project.findById(req.params.id)
      .populate("customerId", "name email company phone");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error("Get Project Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// UPDATE PROJECT
// =============================
exports.updateProject = async (req, res) => {
  try {

    if (req.body.phone) {

      const proj = await Project.findById(req.params.id);

      if (proj?.customerId) {

        const cust = await Customer.findById(proj.customerId);

        if (cust) {
          cust.phone = req.body.phone;
          await cust.save();
        }

      }
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    });

  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// UPDATE STATUS
// =============================
exports.updateProjectStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.status = status;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project status updated",
      data: project
    });

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =============================
// DELETE PROJECT
// =============================
exports.deleteProject = async (req, res) => {
  try {

    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });

  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};