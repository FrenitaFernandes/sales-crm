const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

// ============================
// CREATE LEAD
// ============================
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, source, project, company, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Lead name is required" });
    }

    const lead = await Lead.create({
    name,
    email,
    phone,
    source,
    project,
    company,
    description
  });

  // create customer if not already exists
  const existingCustomer = await Customer.findOne({ email });
  if (!existingCustomer) {
    await Customer.create({
      name,
      email,
      phone,
      status: "Inactive",
    });
  }

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// GET ALL LEADS
// ============================
exports.getCustomerLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ email: req.params.email });

    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error("Get Customer Leads Error:", error);
    res.status(500).json({ message: "Error fetching leads" });
  }
};

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

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.status(200).json({ success: true, data: lead });
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

    if (!lead) return res.status(404).json({ message: "Lead not found" });

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
    const { date, note } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.followUps.push({ date, note });
    await lead.save();

    res.status(200).json({
      success: true,
      message: "Follow-up added",
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
    if (!lead) return res.status(404).json({ message: "Lead not found" });

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

    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};