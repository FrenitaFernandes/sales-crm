import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "customer") {
      alert("Please login as customer to access this page.");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch projects for the logged-in customer
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.data) {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
        <p className="text-sm text-gray-600 mt-1">
          View all your project requests and their status
        </p>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          <p className="text-lg">No projects yet.</p>
          <p className="text-sm mt-2">
            You can customize a new project or wait for admin to create one for you.
          </p>
        </div>
      )}

      {!loading && projects.length > 0 && (
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
                  Details
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Assigned Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
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
                    {project.projectName || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                    {project.customizationDetails || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {project.assignedDate
                      ? new Date(project.assignedDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === "ongoing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {project.status === "ongoing" ? "Ongoing" : "Completed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
