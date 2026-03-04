import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdAdd, MdClose } from "react-icons/md";
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

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
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
      dueDate: ""
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
      endDate: formData.dueDate,
      status: "ongoing"
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

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setProjects(projects.map(p => 
        p._id === projectId ? { ...p, status: newStatus } : p
      ));
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const filteredProjects = projects;
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

      {/* Info Message */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> All customer project requests appear below. You can update the status to mark them as Ongoing or Completed.
        </p>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          <p className="text-lg">No projects found. Customer requests will appear here.</p>
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
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Action
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
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString()
                      : project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === "ongoing" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                      {project.status === "ongoing" ? "Ongoing" : "Completed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusUpdate(project._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
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
