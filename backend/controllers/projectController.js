const Project = require("../models/Project");
const Customer = require("../models/Customer");

// =============================
// CREATE PROJECT
// =============================
exports.createProject = async (req, res) => {
  try {
    // In the front–end we send either a customerId (admin) or customerName (customer/admin)
    // and other fields. For customers the token gives us a user; we map that to a
    // Customer document (creating one if necessary). Admins may supply a customer name
    // so we look it up or create a record.
    let {
      customerId,
      customerName,
      projectName,
      clientName,
      description,
      status,
      startDate,
      endDate,
      budget,
      assignedTo,
      progress,
      dueDate // shipped from frontend
    } = req.body;

    // map form naming
    if (dueDate && !endDate) {
      endDate = dueDate;
    }

    if (!projectName) {
      return res.status(400).json({ message: "Project Name is required" });
    }

    // determine customerId; customers will not send this
    if (!customerId) {
      if (customerName) {
        // try to find existing customer by name
        let customer = await Customer.findOne({ name: customerName });
        if (!customer) {
          // create with a placeholder email if not provided
          customer = await Customer.create({
            name: customerName,
            email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@placeholder.com`,
          });
        }
        customerId = customer._id;
      } else if (req.user && req.user.role === "customer") {
        // if the logged in user is a customer we can try to link by email or name
        let customer = await Customer.findOne({ email: req.user.email });
        if (!customer) {
          customer = await Customer.create({
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
          });
        }
        customerId = customer._id;
      }
    }

    if (!customerId) {
      return res.status(400).json({ message: "Customer information is required" });
    }

    // ensure there is a clientName (project owner) as well
    if (!clientName) {
      // default to customerName or user's name
      clientName = customerName || (req.user && req.user.name);
    }

    const project = await Project.create({
      customerId,
      projectName,
      clientName,
      description,
      status: status || "ongoing",
      startDate: startDate || Date.now(),
      endDate,
      budget,
      assignedTo,
      progress: progress || 0,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });

  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Server Error" });
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

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
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
      data: project,
    });

  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ message: "Server Error" });
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
      return res.status(404).json({ message: "Project not found" });
    }

    project.status = status;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project status updated",
      data: project,
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
      message: "Project deleted successfully",
    });

  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};