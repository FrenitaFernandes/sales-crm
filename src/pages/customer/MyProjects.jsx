import { useEffect, useState } from "react";
import axios from "axios";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMyProjects = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";

        const response = await axios.get("http://localhost:5000/api/projects/my-projects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProjects(response.data?.data || []);
      } catch (fetchError) {
        console.error("Failed to load projects:", fetchError);
        setError(fetchError.response?.data?.message || "Failed to load your projects");
      } finally {
        setIsLoading(false);
      }
    };

    loadMyProjects();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Projects</h2>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-gray-600">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-gray-600">No projects found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Project Name</th>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Customization Details</th>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Expected Due Date</th>
                  <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Created On</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-800">{project.projectName || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{project.description || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{project.status || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(project.endDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(project.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
