import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectOngoing() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ongoing projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/project/ongoing");
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching ongoing projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark project as completed (optional)
  const markCompleted = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/project/${id}`, {
        status: "Completed",
        endDate: new Date(),
      });

      // Refresh list
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ongoing Projects</h2>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <p className="text-gray-500 text-center py-4">No ongoing projects found.</p>
      )}

      {!loading && projects.length > 0 && (
        <div className="bg-white shadow rounded p-4">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Actions</th>
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
                    <span className="badge bg-warning text-dark">Ongoing</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => markCompleted(project._id)}
                    >
                      Mark Completed
                    </button>
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
