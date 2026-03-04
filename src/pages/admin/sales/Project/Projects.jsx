import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdAdd, MdClose } from "react-icons/md";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "admin") {
      alert("Please login as admin to view projects");
      navigate("/login");
    }
  }, [navigate]);

  const [projects, setProjects] = useState([
    // Sample data for testing
    {
      _id: "1",
      projectName: "IoT Products - Data Logger",
      customerName: "RDL Tech",
      customizationDetails: "Custom dashboard with real-time monitoring",
      assignedDate: "2026-01-15",
      dueDate: "2026-03-15",
      progress: 65,
      status: "Ongoing"
    },
    {
      _id: "2",
      projectName: "Cloud Storage Solution",
      customerName: "Shark Tank",
      customizationDetails: "Enterprise cloud storage with backup",
      assignedDate: "2026-01-20",
      dueDate: "2026-02-28",
      progress: 45,
      status: "Ongoing"
    },
    {
      _id: "3",
      projectName: "Energy Management System",
      customerName: "PHP Tech",
      customizationDetails: "Smart energy monitoring and control",
      assignedDate: "2025-12-01",
      dueDate: "2026-01-15",
      progress: 100,
      status: "Completed"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    customerName: "",
    customizationDetails: "",
    assignedDate: "",
    dueDate: "",
    progress: 0,
    status: "Ongoing"
  });

  // Fetch all projects from backend
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.data) {
        // API returns { success, count, data }
        const normalized = res.data.data.map((p) => ({
          ...p,
          customerName: p.customerId?.name || p.customerName,
          assignedDate: p.startDate,
          dueDate: p.endDate,
          customizationDetails: p.description,
        }));
        setProjects(normalized);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Keep sample data if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      projectName: "",
      customerName: "",
      customizationDetails: "",
      assignedDate: "",
      dueDate: "",
      progress: 0,
      status: "Ongoing"
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      projectName: formData.projectName,
      customerName: formData.customerName,
      description: formData.customizationDetails,
      startDate: formData.assignedDate,
      endDate: formData.dueDate,
      status: formData.status,
      progress: Number(formData.progress),
    };

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post("http://localhost:5000/api/projects", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.data) {
        const p = res.data.data;
        const normalized = {
          ...p,
          customerName: p.customerId?.name || p.customerName,
          assignedDate: p.startDate,
          dueDate: p.endDate,
          customizationDetails: p.description,
        };
        setProjects([...projects, normalized]);
      }
      handleCloseModal();
      alert("Project added successfully!");
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    if (activeTab === "ongoing") return project.status === "Ongoing";
    if (activeTab === "completed") return project.status === "Completed";
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        <button
          onClick={handleAddProject}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-md"
        >
          <MdAdd size={20} />
          ADD PROJECT
        </button>
      </div>

      {/* Button Filters */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setActiveTab("ongoing")}
          className={`px-6 py-2.5 rounded-md font-semibold transition-all shadow-sm ${
            activeTab === "ongoing"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Ongoing
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-2.5 rounded-md font-semibold transition-all shadow-sm ${
            activeTab === "completed"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Completed
        </button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          <p className="text-lg">No {activeTab} projects found.</p>
        </div>
      )}

      {!loading && filteredProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  S.No
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Project Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Customer Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Customization Details
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Assigned Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, index) => (
                <tr
                  key={project._id || index}
                  className={`border-b hover:bg-blue-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {project.projectName || project.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {project.customerName || project.companyName || project.customer || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {project.customizationDetails || project.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {project.assignedDate
                      ? new Date(project.assignedDate).toLocaleDateString()
                      : project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString()
                      : project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${
                            activeTab === "completed" ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${project.progress || (activeTab === "completed" ? 100 : 50)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {project.progress || (activeTab === "completed" ? 100 : 50)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Project</h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200"
              >
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customization Details
                  </label>
                  <textarea
                    name="customizationDetails"
                    value={formData.customizationDetails}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customization details"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="assignedDate"
                      value={formData.assignedDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="progress"
                    value={formData.progress}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter progress (0-100)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                  Add Project
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
