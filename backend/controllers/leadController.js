const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Project = require("../models/Project");

// ============================
// CHECK IF EMAIL EXISTS IN CUSTOMERS
// ============================
exports.checkCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // First, check in Customer collection
    const customer = await Customer.findOne({ email: email.toLowerCase() });

    if (customer) {
      // If customer exists, try to get project details
      const project = await Project.findOne({ customerId: customer._id }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        exists: true,
        data: {
          leadName: customer.name,
          projectName: project ? project.projectName : "",
          industryType: customer.industryType || "",
          phone: customer.phone || ""
        }
      });
    }

    // If not found in customers, return not exists
    return res.status(200).json({
      success: true,
      exists: false,
      data: null
    });

  } catch (error) {
    console.error("Check Customer Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// ============================
// GET CUSTOMER LEADS
// ============================
exports.getCustomerLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ email: req.params.email }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error("Get Customer Leads Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// CREATE LEAD
// ============================
exports.createLead = async (req, res) => {
  try {
    const { 
      leadName, 
      email, 
      phone, 
      projectName, 
      industryType, 
      date,
      source, 
      status,
      assignedTo,
      // Legacy fields
      name, 
      project, 
      company, 
      description 
    } = req.body;

    // Validate required fields
    if (!leadName || !email || !phone || !projectName || !industryType) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required: leadName, email, phone, projectName, industryType" 
      });
    }

    const lead = await Lead.create({
      leadName,
      email: email.toLowerCase(),
      phone,
      projectName,
      industryType,
      date: date ? new Date(date) : new Date(),
      source: source || "Unknown",
      status: status || "New",
      assignedTo: assignedTo || null,
      // Also save to legacy fields for backward compatibility
      name: leadName,
      project: projectName,
      company,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });

  } catch (error) {
    console.error("Create Lead Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// ============================
// GET ALL LEADS
// ============================
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });

  } catch (error) {
    console.error("Get Leads Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET SINGLE LEAD
// ============================
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error("Get Lead Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE LEAD
// ============================
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });

  } catch (error) {
    console.error("Update Lead Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// ADD FOLLOW-UP
// ============================
exports.addFollowUp = async (req, res) => {
  try {
    const { date, note, secondNote, followUpDate, status, updatedBy } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Add the follow-up
    lead.followUps.push({ 
      date: date || new Date(), 
      note,
      secondNote,
      followUpDate,
      status,
      updatedBy
    });

    // Update the lead status if provided
    if (status) {
      lead.status = status;
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Follow-up added successfully",
      data: lead,
    });

  } catch (error) {
    console.error("Follow-up Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// UPDATE LEAD STATUS
// ============================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.status = status;
    await lead.save();

    // If lead becomes Interested → activate customer
    if (status === "Interested") {
      await Customer.findOneAndUpdate(
        { email: lead.email },
        { status: "Active" }
      );
    }

    res.status(200).json({
      success: true,
      message: "Lead status updated",
      data: lead,
    });

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// DELETE LEAD
// ============================
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });

  } catch (error) {
    console.error("Delete Lead Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};