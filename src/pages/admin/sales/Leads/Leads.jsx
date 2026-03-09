import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdPhone, MdEmail, MdClose, MdFileDownload, MdEdit as MdEditIcon, MdPerson, MdBusiness, MdLanguage, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { checkCustomerByEmail, createLead, getAllLeads, getLeadById, addFollowUp, deleteLead, updateLead, exportLeadsToPDF } from "../../../../services/leadService";

// Helper function to convert UTC to IST
const convertToIST = (date) => {
  if (!date) return "";
  const utcDate = new Date(date);
  // Add 5 hours 30 minutes for IST
  const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
  return istDate;
};

// Helper function to format date in DD/MM/YYYY HH:MM:SS IST format
const formatDateToIST = (date) => {
  if (!date) return "";
  const istDate = convertToIST(date);
  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const year = istDate.getFullYear();
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const seconds = String(istDate.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export default function Leads() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [assignToFilter, setAssignToFilter] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] = useState(null);

  const [leads, setLeads] = useState([
    {
      id: 1,
      leadName: "Anderson Smith",
      projectName: "IoT Data Logger",
      industryType: "Technology",
      phone: "4551276895",
      email: "anderson@techcorp.com",
      source: "Website",
      status: "New",
      assignedTo: "John Doe",
      date: "05/03/2026, 12:00:00 am",
      lastFollowUp: "Follow Up",
      category: "today",
      followUpHistory: [],
    },
    {
      id: 2,
      leadName: "Emily Johnson",
      projectName: "Cloud Storage System",
      industryType: "Finance",
      phone: "4553986869",
      email: "anderson@techcorp.com",
      source: "Website",
      status: "New",
      assignedTo: "Jane Smith",
      date: "05/03/2026, 12:00:00 am",
      lastFollowUp: "Follow Up",
      category: "today",
      followUpHistory: [],
    },
    {
      id: 3,
      leadName: "Michael Brown",
      projectName: "Healthcare Management",
      industryType: "Healthcare",
      phone: "7854055555",
      email: "michael@gmail.com",
      source: "Cold Call",
      status: "Interested",
      assignedTo: "John Doe",
      date: "04/03/2026, 12:00:00 am",
      lastFollowUp: "Follow Up",
      category: "interested",
      followUpHistory: [],
    },
    {
      id: 4,
      leadName: "Sarah Lee",
      projectName: "Innovation Platform",
      industryType: "Technology",
      phone: "9914388519",
      email: "sarah@email.com",
      source: "Website",
      status: "New",
      assignedTo: "Jane Smith",
      date: "05/03/2026, 12:00:00 am",
      lastFollowUp: "Follow Up",
      category: "today",
      followUpHistory: [],
    },
    {
      id: 5,
      leadName: "David Wilson",
      projectName: "Energy Management",
      industryType: "Energy",
      phone: "9656388256",
      email: "david@email.com",
      source: "Website",
      status: "Not Interested",
      assignedTo: "Mike Johnson",
      date: "03/03/2026, 12:00:00 am",
      lastFollowUp: "Follow Up",
      category: "not-interested",
      followUpHistory: [],
    },
    {
      id: 6,
      leadName: "Jenny Carter",
      projectName: "Startup Solutions",
      industryType: "Technology",
      phone: "5551234567",
      email: "jenny@startups.com",
      source: "Referral",
      status: "Interested",
      assignedTo: "Jane Smith",
      date: "04/03/2026, 12:00:00 am",
      lastFollowUp: "Follow Up",
      category: "interested",
      followUpHistory: [],
    },
    {
      id: 7,
      leadName: "Robert Martinez",
      projectName: "Cloud Infrastructure",
      industryType: "IT Services",
      phone: "5559876543",
      email: "robert@cloud.com",
      source: "LinkedIn",
      status: "Converted",
      assignedTo: "John Doe",
      date: "28/02/2026, 12:00:00 am",
      lastFollowUp: "Completed",
      category: "converted",
      followUpHistory: [],
    },
    {
      id: 8,
      leadName: "Lisa Anderson",
      projectName: "Digital Transformation",
      industryType: "Consulting",
      phone: "5551112222",
      email: "lisa@digital.com",
      source: "Email",
      status: "Dropout",
      assignedTo: "Mike Johnson",
      date: "25/02/2026, 12:00:00 am",
      lastFollowUp: "No Response",
      category: "dropout",
      followUpHistory: [],
    },
  ]);

  const [formData, setFormData] = useState({
    email: "",
    leadName: "",
    projectName: "",
    industryType: "",
    phone: "",
    date: "",
    source: "",
    status: "",
    assignedTo: "",
  });

  const [followUpFormData, setFollowUpFormData] = useState({
    note: "",
    followUpDate: "",
    status: "Contacted",
    assignedTo: "",
    reminder: "1 day before",
  });

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Fetch leads from MongoDB on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await getAllLeads();
        if (response.success && response.data) {
          // Transform MongoDB data to match frontend format
          const transformedLeads = response.data.map((lead) => ({
            id: lead._id,
            leadName: lead.leadName,
            projectName: lead.projectName,
            industryType: lead.industryType,
            phone: lead.phone,
            email: lead.email,
            source: lead.source,
            status: lead.status,
            assignedTo: lead.assignedTo,
            date: formatDateToIST(lead.date),
            lastFollowUp: "Follow Up",
            category: "today",
            // Map backend followUps to followUpHistory
            followUps: lead.followUps || [],
            followUpHistory: (lead.followUps || []).map((followUp, index) => ({
              id: index,
              note: followUp.note,
              secondNote: followUp.secondNote,
              followUpDate: followUp.followUpDate ? formatDateToIST(followUp.followUpDate).split(' ')[0] : "",
              status: followUp.status,
              assignedTo: followUp.updatedBy || lead.assignedTo,
              createdAt: followUp.date ? formatDateToIST(followUp.date) : "",
            })),
          }));
          setLeads(transformedLeads);
        }
      } catch (error) {
        console.error("Failed to load leads:", error);
        // Keep the default leads if API fails
      }
    };

    fetchLeads();
  }, []);

  const productCategories = {
    "": [],
    "IoT Products": ["Data Logger IIoT 4.0", "Cloud PLC", "Biometric Authentication", "HMI & Display Board", "RFID Reader", "IoT CoE", "R-Lifi"],
    "IoT Solutions": ["Water Balancing System", "Shop Floor AI 4.0", "Cloud Storage Monitoring", "Energy Management System"],
    "Services": ["Hardware Design", "Software Development", "Consulting"],
  };

  const statuses = ["New", "Interested", "Not Interested", "Converted", "Dropout"];
  const sources = ["Website", "Cold Call", "Referral", "LinkedIn", "Email"];
  const assignees = ["John Doe", "Jane Smith", "Mike Johnson", "Lisa Anderson"];

  const tabs = [
    { id: "all", label: "All Leads" },
    { id: "today", label: "Today's Lead" },
    { id: "converted", label: "Converted" },
    { id: "interested", label: "Interested" },
    { id: "not-interested", label: "Not Interested" },
    { id: "dropout", label: "Dropout" },
  ];

  const handleAddLead = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      email: "",
      leadName: "",
      projectName: "",
      industryType: "",
      phone: "",
      date: "",
      source: "",
      status: "",
      assignedTo: "",
    });
    setIsCheckingCustomer(false);
    setIsSubmitting(false);
  };

  const handleOpenEditModal = (lead) => {
    setSelectedLeadForEdit(lead);
    // Convert date back to YYYY-MM-DD format for input field
    let dateValue = "";
    if (lead.date) {
      const parts = lead.date.split(/[\s\/:]/);
      if (parts.length >= 3) {
        dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
      }
    }
    setFormData({
      email: lead.email,
      leadName: lead.leadName,
      projectName: lead.projectName,
      industryType: lead.industryType,
      phone: lead.phone,
      date: dateValue,
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedLeadForEdit(null);
    setFormData({
      email: "",
      leadName: "",
      projectName: "",
      industryType: "",
      phone: "",
      date: "",
      source: "",
      status: "",
      assignedTo: "",
    });
    setIsCheckingCustomer(false);
    setIsSubmitting(false);
  };

  const handleOpenFollowUpModal = (lead) => {
    setSelectedLeadForFollowUp(lead);
    setFollowUpFormData({
      note: "",
      followUpDate: "",
      status: "Contacted",
      assignedTo: lead.assignedTo,
      reminder: "1 day before",
    });
    setShowFollowUpModal(true);
  };

  const handleCloseFollowUpModal = () => {
    setShowFollowUpModal(false);
    setSelectedLeadForFollowUp(null);
    setFollowUpFormData({
      note: "",
      followUpDate: "",
      status: "Contacted",
      assignedTo: "",
      reminder: "1 day before",
    });
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeadForFollowUp) return;

    try {
      const userEmail = localStorage.getItem("userEmail") || "admin@example.com";
      
      // Prepare follow-up data for backend
      const followUpPayload = {
        date: new Date(),
        note: followUpFormData.note || "",
        secondNote: "", // Can add this field to the form if needed
        followUpDate: followUpFormData.followUpDate || null,
        status: followUpFormData.status,
        updatedBy: followUpFormData.assignedTo || userEmail,
      };

      console.log("Submitting follow-up:", followUpPayload);
      
      // Save to backend
      const response = await addFollowUp(selectedLeadForFollowUp.id, followUpPayload);
      console.log("Follow-up saved:", response);

      if (response.success) {
        // Update local state with the new data from backend
        const updatedLead = response.data;
        
        setLeads((prevLeads) =>
          prevLeads.map((lead) => {
            if (lead.id !== selectedLeadForFollowUp.id) return lead;

            const transformedLead = {
              ...lead,
              status: updatedLead.status,
              followUps: updatedLead.followUps || [],
              followUpHistory: (updatedLead.followUps || []).map((followUp, index) => ({
                id: index,
                note: followUp.note,
                secondNote: followUp.secondNote,
                followUpDate: followUp.followUpDate ? new Date(followUp.followUpDate).toLocaleDateString("en-GB") : "",
                status: followUp.status,
                assignedTo: followUp.updatedBy || lead.assignedTo,
                createdAt: followUp.date ? new Date(followUp.date).toLocaleString("en-GB") : "",
              })),
              lastFollowUp: followUpFormData.status,
            };

            // Update detail modal if it's open
            if (selectedLeadForDetail && selectedLeadForDetail.id === lead.id) {
              setSelectedLeadForDetail(transformedLead);
            }

            return transformedLead;
          })
        );

        showNotification("Follow-up added successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding follow-up:", error);
      showNotification("Failed to add follow-up. Please try again.", "error");
    }

    handleCloseFollowUpModal();
  };

  const handleFollowUpInputChange = (e) => {
    const { name, value } = e.target;
    setFollowUpFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check if email exists in customers and auto-fill
  const handleEmailBlur = async () => {
    const email = formData.email.trim();
    
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    setIsCheckingCustomer(true);
    try {
      const response = await checkCustomerByEmail(email);
      
      if (response.success && response.exists) {
        // Auto-fill the form with customer data
        setFormData(prev => ({
          ...prev,
          leadName: response.data.leadName || "",
          projectName: response.data.projectName || "",
          industryType: response.data.industryType || "",
          phone: response.data.phone || "",
        }));
        
        // Show success message
        showNotification("Customer found! Details auto-filled.", "info");
      }
    } catch (error) {
      console.error("Error checking customer:", error);
      // Silently fail - user can manually enter data
    } finally {
      setIsCheckingCustomer(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const leadData = {
        leadName: formData.leadName,
        email: formData.email,
        phone: formData.phone,
        projectName: formData.projectName,
        industryType: formData.industryType,
        date: formData.date,
        source: formData.source,
        status: formData.status,
        assignedTo: formData.assignedTo,
      };

      const response = await createLead(leadData);

      if (response.success) {
        showNotification("Lead created successfully!", "success");
        
        // Add the new lead to the local state
        const newLead = {
          id: response.data._id,
          leadName: response.data.leadName,
          projectName: response.data.projectName,
          industryType: response.data.industryType,
          phone: response.data.phone,
          email: response.data.email,
          source: response.data.source,
          status: response.data.status,
          assignedTo: response.data.assignedTo,
          date: formatDateToIST(response.data.date),
          lastFollowUp: "Follow Up",
          category: "today",
          followUpHistory: [],
        };
        
        setLeads([newLead, ...leads]);
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      showNotification(error.response?.data?.message || "Failed to create lead. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const leadData = {
        leadName: formData.leadName,
        email: formData.email,
        phone: formData.phone,
        projectName: formData.projectName,
        industryType: formData.industryType,
        date: formData.date,
        source: formData.source,
        status: formData.status,
        assignedTo: formData.assignedTo,
      };

      const response = await updateLead(selectedLeadForEdit.id, leadData);

      if (response.success) {
        showNotification("Lead updated successfully!", "success");
        
        // Update the lead in the local state
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === selectedLeadForEdit.id
              ? {
                  ...lead,
                  leadName: response.data.leadName,
                  projectName: response.data.projectName,
                  industryType: response.data.industryType,
                  phone: response.data.phone,
                  email: response.data.email,
                  source: response.data.source,
                  status: response.data.status,
                  assignedTo: response.data.assignedTo,
                  date: formatDateToIST(response.data.date),
                }
              : lead
          )
        );
        handleCloseEditModal();
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      showNotification(error.response?.data?.message || "Failed to update lead. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageLeads = filteredLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
      setSelectedLeads([...new Set([...selectedLeads, ...pageLeads.map((lead) => lead.id)])]);
    } else {
      const pageLeads = filteredLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
      setSelectedLeads(selectedLeads.filter((id) => !pageLeads.some((lead) => lead.id === id)));
    }
  };

  const handleDeleteSelected = () => {
    setLeads(leads.filter((lead) => !selectedLeads.includes(lead.id)));
    setSelectedLeads([]);
  };

  const handleDownloadCSV = () => {
    const dataToExport = selectedLeads.length > 0
      ? leads.filter((lead) => selectedLeads.includes(lead.id))
      : filteredLeads;
    
    // CSV export
    const csv = [
      ["Date", "Lead Name", "Project Name", "Industry Type", "Phone", "Email", "Source", "Status", "Assigned To", "Last Follow Up"],
      ...dataToExport.map((lead) => [
        lead.date,
        lead.leadName,
        lead.projectName,
        lead.industryType,
        lead.phone,
        lead.email,
        lead.source,
        lead.status,
        lead.assignedTo,
        lead.lastFollowUp,
      ]),
    ]
      .map((row) => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const handleDownloadPDF = async () => {
    try {
      const dataToExport = selectedLeads.length > 0
        ? leads.filter((lead) => selectedLeads.includes(lead.id))
        : filteredLeads;

      // Call backend to generate PDF
      const blob = await exportLeadsToPDF(dataToExport);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_${new Date().getTime()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showNotification("Failed to download PDF. Please try again.", "error");
    }
  };

  const handleViewLead = async (leadId) => {
    try {
      // Fetch the latest lead data from backend
      const response = await getLeadById(leadId);
      console.log("Full response:", response);
      if (response.success) {
        const lead = response.data;
        console.log("Lead data:", lead);
        console.log("Follow-ups from backend:", lead.followUps);
        
        // Transform the backend data to match frontend format
        const transformedLead = {
          id: lead._id,
          leadName: lead.leadName,
          projectName: lead.projectName,
          industryType: lead.industryType,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          status: lead.status,
          assignedTo: lead.assignedTo,
          date: formatDateToIST(lead.date),
          lastFollowUp: "Follow Up",
          followUps: lead.followUps || [],
          followUpHistory: (lead.followUps || []).map((followUp, index) => ({
            id: index,
            note: followUp.note,
            secondNote: followUp.secondNote,
            followUpDate: followUp.followUpDate ? formatDateToIST(followUp.followUpDate).split(' ')[0] : "",
            status: followUp.status,
            assignedTo: followUp.updatedBy || lead.assignedTo,
            createdAt: followUp.date ? formatDateToIST(followUp.date) : "",
          })),
        };
        console.log("Transformed lead:", transformedLead);
        console.log("Follow-up history count:", transformedLead.followUpHistory.length);
        setSelectedLeadForDetail(transformedLead);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
      showNotification("Failed to load lead details", "error");
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLeadForDetail(null);
  };

  // Delete specific follow-up entry
  const handleDeleteFollowUp = async (followUpIndex) => {
    if (!selectedLeadForDetail) return;

    setFollowUpToDelete(followUpIndex);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFollowUp = async () => {
    if (!selectedLeadForDetail || followUpToDelete === null) return;

    setShowDeleteConfirm(false);
    const followUpIndex = followUpToDelete;
    setFollowUpToDelete(null);

    try {
      // Get the lead data from backend to ensure we have the latest followUps array
      const response = await getLeadById(selectedLeadForDetail.id);
      const lead = response.data;
      
      // Remove the follow-up at the specified index
      const updatedFollowUps = [...(lead.followUps || [])];
      updatedFollowUps.splice(followUpIndex, 1);
      
      // Update the lead with new followUps array
      const updateResponse = await fetch(`http://localhost:5000/api/leads/${selectedLeadForDetail.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ followUps: updatedFollowUps }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to delete follow-up');
      }

      // Refresh the lead data to show updated follow-ups
      await handleViewLead(selectedLeadForDetail.id);
      
      showNotification("Follow-up deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting follow-up:", error);
      showNotification("Failed to delete follow-up. Please try again.", "error");
    }
  };

  const cancelDeleteFollowUp = () => {
    setShowDeleteConfirm(false);
    setFollowUpToDelete(null);
  };

  // Export lead as PDF
  const handleExportLeadAsPDF = () => {
    if (!selectedLeadForDetail) return;

    try {
      // Create PDF content
      let pdfContent = `
========================================
LEAD DETAILS
========================================

Contact Information:
--------------------
Name: ${selectedLeadForDetail.leadName}
Email: ${selectedLeadForDetail.email}
Phone: ${selectedLeadForDetail.phone}
Industry: ${selectedLeadForDetail.industryType}
Project: ${selectedLeadForDetail.projectName}

Lead Information:
-----------------
Status: ${selectedLeadForDetail.status}
Source: ${selectedLeadForDetail.source}
Assigned To: ${selectedLeadForDetail.assignedTo}
Date Created: ${selectedLeadForDetail.date}

========================================
FOLLOW-UP HISTORY
========================================
`;

      if (selectedLeadForDetail.followUpHistory && selectedLeadForDetail.followUpHistory.length > 0) {
        selectedLeadForDetail.followUpHistory.forEach((followUp, index) => {
          pdfContent += `
${index + 1}. Follow-Up Entry
--------------------
Status: ${followUp.status || 'N/A'}
Date: ${followUp.createdAt || 'N/A'}
Note: ${followUp.note || 'No notes'}
${followUp.secondNote ? `Additional Note: ${followUp.secondNote}` : ''}
${followUp.followUpDate ? `Next Follow-Up: ${followUp.followUpDate}` : ''}
Assigned To: ${followUp.assignedTo || 'N/A'}

`;
        });
      } else {
        pdfContent += "\nNo follow-up history available.\n";
      }

      pdfContent += `
========================================
Generated on: ${new Date().toLocaleString()}
========================================
`;

      // Create a blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lead_${selectedLeadForDetail.leadName.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      showNotification("Lead details exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting lead:", error);
      showNotification("Failed to export lead details.", "error");
    }
  };

  // Filter leads based on search and filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.industryType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesSource = !sourceFilter || lead.source === sourceFilter;
    const matchesAssignee = !assignToFilter || lead.assignedTo.toLowerCase().includes(assignToFilter.toLowerCase());
    
    // Tab filtering
    let matchesTab = true;
    if (activeTab === "today") {
      matchesTab = lead.category === "today" || lead.status === "New";
    } else if (activeTab === "interested") {
      matchesTab = lead.status === "Interested" || lead.category === "interested";
    } else if (activeTab === "converted") {
      matchesTab = lead.status === "Converted" || lead.category === "converted";
    } else if (activeTab === "not-interested") {
      matchesTab = lead.status === "Not Interested" || lead.category === "not-interested";
    } else if (activeTab === "dropout") {
      matchesTab = lead.status === "Dropout" || lead.category === "dropout";
    }

    return matchesSearch && matchesStatus && matchesSource && matchesAssignee && matchesTab;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageLeadIds = paginatedLeads.map((lead) => lead.id);
  const allPageLeadsSelected = pageLeadIds.every((id) => selectedLeads.includes(id));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold animate-fade-in ${
          notification.type === "success" ? "bg-green-500" : 
          notification.type === "error" ? "bg-red-500" : 
          "bg-blue-500"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Leads Management</h2>
        <button
          onClick={handleAddLead}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          <MdAdd size={20} />
          ADD LEAD
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search leads</label>
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Assign To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <input
              type="text"
              placeholder="Type name to filter"
              value={assignToFilter}
              onChange={(e) => {
                setAssignToFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedLeads.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold text-sm"
          >
            <MdDelete size={16} />
            Delete
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold text-sm"
          >
            <MdFileDownload size={16} /> Download CSV
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            <MdFileDownload size={16} /> Download PDF
          </button>
          <span className="text-sm text-gray-600 self-center ml-2">
            {selectedLeads.length} selected
          </span>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex gap-2 relative">
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold text-sm">
          <span>⚙️</span> Assign
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        {paginatedLeads.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No leads found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allPageLeadsSelected && pageLeadIds.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lead Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Industry Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Follow Up</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className={`border-b hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {lead.leadName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.projectName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.industryType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.source}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          lead.status === "New"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "Contacted"
                            ? "bg-purple-100 text-purple-800"
                            : lead.status === "Qualified"
                            ? "bg-yellow-100 text-yellow-800"
                            : lead.status === "Interested"
                            ? "bg-cyan-100 text-cyan-800"
                            : lead.status === "Converted"
                            ? "bg-green-100 text-green-800"
                            : lead.status === "Not Interested"
                            ? "bg-red-100 text-red-800"
                            : lead.status === "Dropout"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{lead.assignedTo}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenFollowUpModal(lead)}
                        className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        {lead.lastFollowUp}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewLead(lead.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                          title="View"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(lead)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-xs bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors"
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of{" "}
                {filteredLeads.length} leads
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">{filteredLeads.length}</span>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 text-sm"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page >= currentPage - 1 && page <= currentPage + 1)
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 text-sm"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Lead</h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200"
              >
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email
                    {isCheckingCustomer && (
                      <span className="ml-2 text-xs text-blue-600">Checking customer...</span>
                    )}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    required
                    disabled={isCheckingCustomer}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Enter email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If this email is a customer, details will be auto-filled
                  </p>
                </div>

                {/* Lead Name */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Lead Name</label>
                  <input
                    type="text"
                    name="leadName"
                    value={formData.leadName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter lead name"
                  />
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                  />
                </div>

                {/* Industry Type */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Industry Type</label>
                  <input
                    type="text"
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter industry type"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Source</option>
                    {sources.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Status</option>
                    {statuses.map((stat) => (
                      <option key={stat} value={stat}>
                        {stat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Assigned To</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assignee name"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingCustomer}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && selectedLeadForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Edit Lead</h3>
              <button
                onClick={handleCloseEditModal}
                className="text-white hover:text-gray-200"
              >
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Lead Name */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Lead Name</label>
                  <input
                    type="text"
                    name="leadName"
                    value={formData.leadName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter lead name"
                  />
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter project name"
                  />
                </div>

                {/* Industry Type */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Industry Type</label>
                  <input
                    type="text"
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter industry type"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Select Source</option>
                    {sources.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Select Status</option>
                    {statuses.map((stat) => (
                      <option key={stat} value={stat}>
                        {stat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Assigned To</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter assignee name"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingCustomer}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow Up Modal */}
      {showFollowUpModal && selectedLeadForFollowUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Follow Up</h3>
                <p className="text-sm text-blue-100 mt-1">{selectedLeadForFollowUp.leadName}</p>
              </div>
              <button
                onClick={handleCloseFollowUpModal}
                className="text-white hover:text-gray-200"
              >
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleFollowUpSubmit} className="p-6">
              <div className="space-y-4">
                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    name="note"
                    value={followUpFormData.note}
                    onChange={handleFollowUpInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter follow up note..."
                  />
                </div>

                {/* Follow Up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow Up Date</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={followUpFormData.followUpDate}
                    onChange={handleFollowUpInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex gap-2 mb-3">
                    <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-medium">
                      {followUpFormData.status}
                    </span>
                  </div>
                  <select
                    name="status"
                    value={followUpFormData.status}
                    onChange={handleFollowUpInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>

                {/* Assign To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={followUpFormData.assignedTo}
                    onChange={handleFollowUpInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assignee name"
                  />
                </div>

                {/* Set Reminder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Set Reminder</label>
                  <select
                    name="reminder"
                    value={followUpFormData.reminder}
                    onChange={handleFollowUpInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="1 day before">1 day before</option>
                    <option value="2 days before">2 days before</option>
                    <option value="1 week before">1 week before</option>
                    <option value="On the day">On the day</option>
                    <option value="No reminder">No reminder</option>
                  </select>
                </div>

                {/* Follow Up History */}
                {selectedLeadForFollowUp.followUpHistory && selectedLeadForFollowUp.followUpHistory.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-800 mb-4">Follow Up History</h4>
                    <div className="space-y-4">
                      {selectedLeadForFollowUp.followUpHistory.map((followUp, index) => (
                        <div key={followUp.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 bg-blue-600 rounded-full mt-1"></div>
                            {index < selectedLeadForFollowUp.followUpHistory.length - 1 && (
                              <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{followUp.followUpDate}</span>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  followUp.status === "Converted"
                                    ? "bg-green-100 text-green-700"
                                    : followUp.status === "Interested"
                                    ? "bg-cyan-100 text-cyan-700"
                                    : followUp.status === "Not Interested"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {followUp.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{followUp.note}</p>
                            <p className="text-xs text-gray-500">
                              Assigned to: <span className="font-medium">{followUp.assignedTo}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: <span className="font-medium">{followUp.createdAt}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseFollowUpModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showDetailModal && selectedLeadForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseDetailModal}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <MdArrowBack size={24} />
                </button>
                <h3 className="text-xl font-bold text-gray-800">Lead Details</h3>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-600 hover:text-gray-800"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Profile Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedLeadForDetail.leadName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedLeadForDetail.leadName}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MdPhone size={16} />
                          <span>{selectedLeadForDetail.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MdEmail size={16} />
                          <span>{selectedLeadForDetail.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MdBusiness size={16} />
                          <span>{selectedLeadForDetail.industryType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Source</p>
                    <p className="font-semibold text-gray-800">{selectedLeadForDetail.source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedLeadForDetail.status === "Converted"
                          ? "bg-green-100 text-green-700"
                          : selectedLeadForDetail.status === "Interested"
                          ? "bg-cyan-100 text-cyan-700"
                          : selectedLeadForDetail.status === "Not Interested"
                          ? "bg-red-100 text-red-700"
                          : selectedLeadForDetail.status === "Dropout"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {selectedLeadForDetail.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                    <p className="font-semibold text-gray-800">{selectedLeadForDetail.assignedTo}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button 
                  onClick={handleExportLeadAsPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <MdFileDownload size={16} />
                  Export as PDF
                </button>
              </div>

              {/* Follow Up History */}
              <div>
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-gray-800">Follow Up History</h4>
                </div>

                {selectedLeadForDetail.followUpHistory && selectedLeadForDetail.followUpHistory.length > 0 ? (
                  <div className="space-y-6">
                    {selectedLeadForDetail.followUpHistory.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {activity.status === 'Converted' ? '✓' : 
                             activity.status === 'Interested' ? '★' : 
                             activity.status === 'Contacted' ? '📞' : 'ℹ'}
                          </div>
                          {index < selectedLeadForDetail.followUpHistory.length - 1 && (
                            <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800 text-sm mb-1">
                                {activity.status === 'Converted' ? 'Lead Converted' : 
                                 activity.status === 'Interested' ? 'Lead Interested' : 
                                 activity.status === 'Contacted' ? 'Follow-up Completed' : 
                                 'Status Updated'}
                              </h5>
                              <p className="text-sm text-gray-600">{activity.note || 'No additional notes'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                  activity.status === "Converted"
                                    ? "bg-green-100 text-green-700"
                                    : activity.status === "Interested"
                                    ? "bg-cyan-100 text-cyan-700"
                                    : activity.status === "Not Interested"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {activity.status}
                              </span>
                              <button
                                onClick={() => handleDeleteFollowUp(selectedLeadForDetail.followUpHistory.length - 1 - index)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full transition-colors"
                                title="Delete this follow-up"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                            <div>Next Follow-Up: <span className="font-medium text-gray-700">{activity.followUpDate}</span></div>
                            <div>Assigned to: <span className="font-medium text-gray-700">{activity.assignedTo}</span></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            <span>Updated By: {activity.assignedTo}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{activity.createdAt}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 mb-2">
                      <MdPerson size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-600">No follow up history yet</p>
                    <p className="text-sm text-gray-500 mt-1">Follow-up activities will appear here</p>
                  </div>
                )}

                {/* Lead Created Entry - Always at the bottom */}
                <div className="flex gap-4 mt-6 pt-6 border-t">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white">
                      <MdPerson size={20} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 text-sm mb-1">Lead Created</h5>
                    <p className="text-sm text-gray-600 mb-2">New lead was created in the system</p>
                    <div className="text-xs text-gray-400">{selectedLeadForDetail.date}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this follow-up entry?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteFollowUp}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFollowUp}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
