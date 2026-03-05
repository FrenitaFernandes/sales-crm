import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdAdd, MdClose, MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Projects() {

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [formData, setFormData] = useState({
    projectName: "",
    customerName: "",
    phone: "",
    customizationDetails: "",
    dueDate: ""
  });

  // AUTH CHECK + FETCH
  useEffect(() => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
      alert("Please login as admin to view projects");
      navigate("/login");
      return;
    }

    fetchProjects(token);

  }, [navigate]);


  // FETCH PROJECTS
  const fetchProjects = async (token) => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/projects",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.data) {

        const normalized = res.data.data.map((p) => ({
          ...p,
          customerName: p.customerId?.name || p.customerName,
          phone: p.phone || p.phoneNumber || p.customerId?.phone || "",
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


  const handleAddProject = () => {
    setShowAddModal(true);
  };


  const handleCloseModal = () => {

    setShowAddModal(false);

    setFormData({
      projectName: "",
      customerName: "",
      phone: "",
      customizationDetails: "",
      dueDate: ""
    });
  };


  const handleInputChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  // ADD PROJECT
  const handleSubmit = async (e) => {

    e.preventDefault();

    const payload = {
      projectName: formData.projectName,
      customerName: formData.customerName,
      phone: formData.phone,
      description: formData.customizationDetails,
      endDate: formData.dueDate,
      status: "ongoing"
    };

    try {

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/projects",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.data) {

        const p = res.data.data;

        const normalized = {
          ...p,
          customerName: p.customerId?.name || p.customerName,
          phone: p.phone || p.phoneNumber || p.customerId?.phone || "",
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


  // UPDATE STATUS
  const handleStatusUpdate = async (projectId, newStatus) => {

    try {

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProjects(
        projects.map((p) =>
          p._id === projectId ? { ...p, status: newStatus } : p
        )
      );

      alert("Status updated successfully!");

    } catch (error) {

      console.error("Error updating status:", error);
      alert("Failed to update status");

    }
  };
const openDeleteModal = (project) => {
  setDeleteTarget(project || null);
  setDeleteMessage("");
  setDeleteError("");
};

const closeDeleteModal = () => {
  setDeleteTarget(null);
};

const handleDeleteProject = async () => {
  if (!deleteTarget?._id) return;

  try {
    setIsDeleting(true);
    setDeleteError("");

    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/projects/${deleteTarget._id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    setDeleteMessage("Project deleted successfully!");
    setDeleteTarget(null);

  } catch (error) {

    console.error("Delete project error:", error);
    setDeleteError("Failed to delete project");

  } finally {
    setIsDeleting(false);
  }
};

  return (

    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="mb-6 flex justify-between items-center">

        <h2 className="text-2xl font-bold text-gray-800">
          Projects
        </h2>

        <button
          onClick={handleAddProject}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold shadow-md"
        >
          <MdAdd size={20} />
          ADD PROJECT
        </button>

      </div>

      {deleteMessage && (
        <div className="alert alert-success py-2 mb-3">{deleteMessage}</div>
      )}

      {deleteError && (
        <div className="alert alert-danger py-2 mb-3">{deleteError}</div>
      )}


      {/* LOADING */}

      {loading && (
        <div className="text-center py-10 text-gray-500">
          Loading projects...
        </div>
      )}


      {/* EMPTY */}

      {!loading && projects.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No projects found.
        </div>
      )}


      {/* TABLE */}

      {!loading && projects.length > 0 && (

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">

          <table className="w-full">

            <thead className="bg-blue-100 border-b">

              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">S.No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Project Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customization</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>

            </thead>


            <tbody>

              {projects.map((project, index) => (

                <tr key={project._id} className="border-b hover:bg-blue-50">

                  <td className="px-4 py-3 text-sm">{index + 1}</td>

                  <td className="px-4 py-3 text-sm">{project.projectName || "-"}</td>

                  <td className="px-4 py-3 text-sm">{project.customerName || "-"}</td>

                  <td className="px-4 py-3 text-sm">{project.phone || "-"}</td>

                  <td className="px-4 py-3 text-sm">{project.customizationDetails || "-"}</td>

                  <td className="px-4 py-3 text-sm">
                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "-"}
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


                  <td className="px-4 py-3 text-sm flex items-center gap-2">

  <select
    value={project.status}
    onChange={(e) =>
      handleStatusUpdate(project._id, e.target.value)
    }
    className="px-3 py-1 border rounded text-xs"
  >
    <option value="ongoing">Ongoing</option>
    <option value="completed">Completed</option>
  </select>

  <button
    onClick={() => openDeleteModal(project)}
    className="text-red-600 hover:text-red-800"
    title="Delete Project"
  >
    <MdDelete size={18} />
  </button>

</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}


      {/* ADD PROJECT MODAL */}

      {showAddModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">

            <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-4 rounded-t-lg">

              <h3 className="text-lg font-bold">Add Project</h3>

              <button onClick={handleCloseModal}>
                <MdClose size={22} />
              </button>

            </div>


            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <input
                type="text"
                name="projectName"
                placeholder="Project Name"
                value={formData.projectName}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="text"
                name="customerName"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />

              <textarea
                name="customizationDetails"
                placeholder="Customization Details"
                value={formData.customizationDetails}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="w-full border px-3 py-2 rounded"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Add Project
              </button>

            </form>

          </div>

        </div>

      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete this project?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteProject}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}