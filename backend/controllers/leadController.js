const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Project = require("../models/Project");
const { LEAD_INDUSTRY_TYPES } = require("../constants/leadIndustryTypes");

const isValidIndustryType = (industryType) =>
  typeof industryType === "string" && LEAD_INDUSTRY_TYPES.includes(industryType);

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

    if (!isValidIndustryType(industryType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid industry type",
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
// GET TODAY'S LEADS
// ============================
exports.getTodayLeads = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const leads = await Lead.find({
      date: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error("Get Today Leads Error:", error);
    res.status(500).json({ message: "Server error" });
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
    if (
      Object.prototype.hasOwnProperty.call(req.body, "industryType") &&
      !isValidIndustryType(req.body.industryType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid industry type",
      });
    }

    const updatePayload = { ...req.body };

    if (typeof updatePayload.email === "string") {
      updatePayload.email = updatePayload.email.toLowerCase();
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
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
    res.status(500).json({ message: error.message || "Server error" });
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
    const statusCode = error.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({
      message: error.message || "Server error"
    });
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

// ============================
// EXPORT LEADS AS PDF
// ============================
exports.exportLeadsToPDF = async (req, res) => {
  const PDFDocument = require('pdfkit');
  const formatToIST = (value) => {
    if (!value) return "N/A";

    // If date already arrives in DD/MM/YYYY HH:MM:SS format, keep it.
    if (typeof value === "string" && value.includes("/") && value.includes(":")) {
      return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return String(value);
    }

    return parsed.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const writeField = (doc, label, value) => {
    doc.font("Helvetica-Bold").fontSize(10).text(`${label}: `, { continued: true });
    doc.font("Helvetica").fontSize(10).text(value || "N/A");
  };
  
  try {
    const { leads } = req.body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No leads provided for export"
      });
    }

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="leads_${new Date().getTime()}.pdf"`);

    // Pipe document to response
    doc.pipe(res);

    // Add title
    doc.fontSize(24).font('Helvetica-Bold').text('Leads Report', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, { align: 'center' });
    doc.moveDown(1);

    // Add summary
    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(11).font('Helvetica').text(`Total Leads: ${leads.length}`);
    doc.moveDown(1);

    leads.forEach((lead, index) => {
      if (doc.y > 680) {
        doc.addPage();
      }

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fill("black")
        .text(`Lead ${index + 1}`, { underline: true });
      doc.moveDown(0.4);

      writeField(doc, "Date", formatToIST(lead.date));
      writeField(doc, "Lead Name", lead.leadName);
      writeField(doc, "Project Name", lead.projectName);
      writeField(doc, "Industry Type", lead.industryType);
      writeField(doc, "Phone", lead.phone);
      writeField(doc, "Email", lead.email);
      writeField(doc, "Source", lead.source);
      writeField(doc, "Status", lead.status);
      writeField(doc, "Assigned To", lead.assignedTo);
      writeField(doc, "Last Follow Up", lead.lastFollowUp || "Follow Up");

      const followUps = Array.isArray(lead.followUps)
        ? lead.followUps
        : Array.isArray(lead.followUpHistory)
        ? lead.followUpHistory
        : [];

      if (followUps.length > 0) {
        doc.moveDown(0.2);
        doc.fontSize(10).font("Helvetica-Bold").text("Follow-Up History:");
        followUps.forEach((item, followIndex) => {
          const note = item.note || item.secondNote || "No notes";
          const status = item.status || "N/A";
          const followDate = formatToIST(item.followUpDate || item.date || item.createdAt);
          doc
            .fontSize(9)
            .font("Helvetica")
            .text(`${followIndex + 1}. Status: ${status} | Date: ${followDate} | Note: ${note}`);
        });
      }

      doc.moveDown(0.5);
      doc.strokeColor("#d1d5db").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.6);
    });

    // Add footer
    if (doc.y > 730) {
      doc.addPage();
    }
    doc.moveDown(1);
    doc.fontSize(9).font('Helvetica').text('This is an auto-generated report from Sales CRM', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("PDF Export Error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message
    });
  }
};