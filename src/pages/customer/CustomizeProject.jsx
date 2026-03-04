import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CustomizeProject() {
  const navigate = useNavigate();

  // redirect if not logged in or not customer
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "customer") {
      alert("Please login as customer to access this page.");
      navigate("/login");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    projectName: "",
    customerName: "",
    phone: "",
    customizationDetails: "",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:5000/api/projects",
        {
          projectName: formData.projectName,
          customerName: formData.customerName,
          phone: formData.phone,
          description: formData.customizationDetails,
          dueDate: formData.dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('[CustomizeProject] submit -> sent', {
        projectName: formData.projectName,
        customerName: formData.customerName,
        phone: formData.phone,
      });
      // Optionally could log response if needed (kept out to avoid leaking user data)

      alert("Project Customization Request Submitted Successfully!");

      setFormData({
        projectName: "",
        customerName: "",
        customizationDetails: "",
        dueDate: "",
      });

    } catch (error) {
      console.error("Error submitting project:", error.response || error);
      const errorMsg = error.response?.data?.message || error.message || "Something went wrong!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-start">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-6">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Customize Your Project
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Project Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter project name"
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter contact number"
            />
          </div>

          {/* Customization Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Customization Details
            </label>
            <textarea
              name="customizationDetails"
              value={formData.customizationDetails}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Describe your customization requirements"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Expected Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Submitting..." : "Submit Customization"}
          </button>

        </form>
      </div>
    </div>
  );
}
