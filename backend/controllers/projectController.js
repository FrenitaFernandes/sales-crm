const mongoose = require("mongoose");
const Project = require("../models/Project");
const Customer = require("../models/Customer");


// =============================
// CREATE PROJECT
// =============================
exports.createProject = async (req, res) => {

  console.log("[projectController] createProject body:", req.body);

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

    const fallbackUserId = req.user?._id || new mongoose.Types.ObjectId();

    if (dueDate && !endDate) endDate = dueDate;
    if (customizationDetails && !description) description = customizationDetails;

    if (!projectName) {
      return res.status(400).json({ message: "Project Name is required" });
    }

    // =============================
    // FIND OR CREATE CUSTOMER
    // =============================
    if (!customerId) {

      let customer = null;

      // 1️⃣ Try finding by email first
      if (email) {
        customer = await Customer.findOne({ email });
      }

      // 2️⃣ If not found, create new customer
      if (!customer) {

        customer = await Customer.create({
          userId: fallbackUserId,
          name: customerName || req.user?.name || "Customer",
          email: email || req.user?.email,
          phone: phone || req.user?.phone
        });

      }

      // 3️⃣ Update phone if changed
      if (phone && customer.phone !== phone) {
        customer.phone = phone;
        await customer.save();
      }

      customerId = customer._id;
    }

    if (!customerId) {
      return res.status(400).json({ message: "Customer information is required" });
    }

    if (!clientName) {
      clientName = customerName || req.user?.name;
    }

    // =============================
    // CREATE PROJECT
    // =============================
    const project = await Project.create({
      customerId,
      projectName,
      clientName,
      email,
      description,
      phone,
      status: status || "ongoing",
      startDate: startDate || Date.now(),
      endDate,
      budget,
      assignedTo,
      progress: progress || 0
    });

    const populatedProject = await project.populate(
      "customerId",
      "name email company phone"
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

  } catch (error) {

    console.error("Create Project Error:", error);

    res.status(500).json({
      message: "Server Error"
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

    res.status(500).json({
      message: "Server Error"
    });
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
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {

    console.error("Get Project Error:", error);

    res.status(500).json({
      message: "Server Error"
    });
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
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    });

  } catch (error) {

    console.error("Update Project Error:", error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};



// =============================
// UPDATE PROJECT STATUS
// =============================
exports.updateProjectStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
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

    res.status(500).json({
      message: "Server Error"
    });
  }
};



// =============================
// DELETE PROJECT
// =============================
exports.deleteProject = async (req, res) => {

  try {

    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });

  } catch (error) {

    console.error("Delete Project Error:", error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};