// src/pages/admin/sales/Project/Completed.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectCompleted() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed projects
  const fetchCompletedProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/project/completed");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching completed projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Completed Projects</h2>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {/* No Data */}
      {!loading && projects.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No completed projects found.
        </p>
      )}

      {/* Table */}
      {!loading && projects.length > 0 && (
        <div className="bg-white shadow rounded p-4">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>Completed On</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project, index) => (
                <tr key={project._id}>
                  <td>{index + 1}</td>
                  <td>{project.title}</td>
                  <td>{project.description}</td>
                  <td>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <span className="badge bg-success">Completed</span>
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
