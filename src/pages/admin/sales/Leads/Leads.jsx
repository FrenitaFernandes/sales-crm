import { useState } from "react";
import { MdAdd, MdEdit, MdDelete, MdPhone, MdEmail, MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Leads() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("today");
  const [showAddModal, setShowAddModal] = useState(false);
  const [leads, setLeads] = useState([
    {
      id: 1,
      date: "2025-05-04T18:30:00.000Z",
      projectName: "IotProducts - Data Logger IIoT 4.0",
      companyName: "rdl",
      lfDetails: "simple",
      followUp: "FOLLOW UP",
      phoneNumber: "4561237895, 07894561235",
      contactPerson: "TEST",
      email: "TEST@GMAIL.COM",
      leadStatus: "today",
      status: "preranarp@gmail.com",
      updatedBy: "preranarp@gmail.com",
      category: "IoT Products",
      product: "Data Logger IIoT 4.0",
      description: "Testing",
    },
    {
      id: 2,
      date: "2025-05-30T18:30:00.000Z",
      projectName: "IotSolutions - Cloud Storage Monitoring",
      companyName: "sharktank",
      lfDetails: "simple",
      followUp: "FOLLOW UP",
      phoneNumber: "7654487988, 87656689",
      contactPerson: "adithya",
      email: "adithya@gmail.com",
      leadStatus: "today",
      status: "preranarp@gmail.com",
      updatedBy: "preranarp@gmail.com",
      category: "IoT Solutions",
      product: "Cloud Storage Monitoring",
      description: "na",
    },
    {
      id: 3,
      date: "2025-04-11T18:30:00.000Z",
      projectName: "IotSolutions - Energy Management System",
      companyName: "php tech",
      lfDetails: "simple",
      followUp: "FOLLOW UP",
      phoneNumber: "06546768709, 07894561235",
      contactPerson: "hari",
      email: "priyanka@gmail.com",
      leadStatus: "not-interested",
      status: "preranarp@gmail.com",
      updatedBy: "preranarp@gmail.com",
      category: "IoT Solutions",
      product: "Energy Management System",
      description: "qwri",
    },
  ]);

  const [formData, setFormData] = useState({
    category: "",
    product: "",
    description: "",
    companyName: "",
    phoneNumber: "",
    contactPerson: "",
  });

  const productCategories = {
    "": [],
    "IoT Products": ["Data Logger IIoT 4.0", "Cloud PLC", "Biometric Authentication", "HMI & Display Board", "RFID Reader", "IoT CoE", "R-Lifi"],
    "IoT Solutions": ["Water Balancing System", "Shop Floor AI 4.0", "Cloud Storage Monitoring", "Energy Management System"],
    "Services": ["Hardware Design", "Software Development", "Consulting"],
  };

  const tabs = [
    { id: "today", label: "TODAY'S LEADS" },
    { id: "converted", label: "CONVERTED" },
    { id: "interested", label: "INTERESTED" },
    { id: "not-interested", label: "NOT INTERESTED" },
    { id: "dropout", label: "DROPOUT" },
  ];

  const handleAddLead = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      category: "",
      product: "",
      description: "",
      companyName: "",
      phoneNumber: "",
      contactPerson: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLead = {
      id: leads.length + 1,
      date: new Date().toISOString(),
      projectName: `${formData.category} - ${formData.product}`,
      companyName: formData.companyName,
      lfDetails: formData.description,
      followUp: "FOLLOW UP",
      phoneNumber: formData.phoneNumber,
      contactPerson: formData.contactPerson,
      email: "",
      leadStatus: "today",
      status: "New",
      updatedBy: "current-user@gmail.com",
      category: formData.category,
      product: formData.product,
      description: formData.description,
    };
    setLeads([...leads, newLead]);
    handleCloseModal();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleViewLead = (leadId) => {
    navigate(`/admin/sales/leads/${leadId}`);
  };

  const filteredLeads = leads.filter((lead) => {
    if (activeTab === "today") return lead.leadStatus === "today";
    if (activeTab === "converted") return lead.leadStatus === "converted";
    if (activeTab === "interested") return lead.leadStatus === "interested";
    if (activeTab === "not-interested") return lead.leadStatus === "not-interested";
    if (activeTab === "dropout") return lead.leadStatus === "dropout";
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Leads Management</h2>
        <button
          onClick={handleAddLead}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-md"
        >
          <MdAdd size={20} />
          ADD LEAD
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-300">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No result in this category</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Project Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">LF Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">FollowUp</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact Person</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Updated By</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr 
                  key={lead.id} 
                  className={`border-b hover:bg-blue-50 cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  onClick={() => handleViewLead(lead.id)}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(lead.date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.projectName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.companyName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.lfDetails}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1.5 rounded text-xs font-medium uppercase tracking-wide">
                      Follow Up
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.phoneNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.contactPerson}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{lead.updatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              {/* Product Selector */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Product Selector</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Select Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">None</option>
                      <option value="IoT Products">IoT Products</option>
                      <option value="IoT Solutions">IoT Solutions</option>
                      <option value="Services">Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Select Option</label>
                    <select
                      name="product"
                      value={formData.product}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.category}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
                    >
                      <option value="">None</option>
                      {productCategories[formData.category]?.map((product) => (
                        <option key={product} value={product}>
                          {product}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description"
                    />
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Company</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contact Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contact number"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contact person"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
