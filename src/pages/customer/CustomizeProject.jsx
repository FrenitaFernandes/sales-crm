import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CustomizeProject() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerId: "",
    projectName: "",
    customerName: "",
    email: "",
    phone: "",
    customizationDetails: "",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState("");
  const [uiMessageType, setUiMessageType] = useState("success");

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  const getStoredUserContact = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        customerName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      };
    } catch (error) {
      return {
        customerName: "",
        email: "",
        phone: "",
      };
    }
  };

  // AUTH CHECK
  useEffect(() => {

    const token = getToken();
    const role = localStorage.getItem("userRole");

    if (!token || role !== "customer") {
      setUiMessageType("error");
      setUiMessage("Please login as customer to access this page.");
      navigate("/login");
      return;
    }

    // Prefill from localStorage immediately for better UX.
    const localContact = getStoredUserContact();
    setFormData((prev) => ({
      ...prev,
      customerName: localContact.customerName || prev.customerName,
      email: localContact.email || prev.email,
      phone: localContact.phone || prev.phone,
    }));

    // Refresh with backend profile data when available.
    const loadCustomerProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/customers/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = res.data?.customer || res.data?.data || {};

        setFormData((prev) => ({
          ...prev,
          customerId: profile._id || prev.customerId,
          customerName: profile.name || prev.customerName,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
        }));
      } catch (error) {
        console.error("Profile prefill error:", error);
      }
    };

    loadCustomerProfile();

  }, [navigate]);



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

      const token = getToken();
      const normalizeDueDate = (value) => {
        const raw = String(value || "").trim();
        if (!raw) return "";

        // Accept dd-mm-yyyy from manual typing and convert to yyyy-mm-dd.
        const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (ddmmyyyy) {
          const [, dd, mm, yyyy] = ddmmyyyy;
          return `${yyyy}-${mm}-${dd}`;
        }

        return raw;
      };

      await axios.post(
        "http://localhost:5000/api/projects",
        {
          customerId: formData.customerId || undefined,
          projectName: formData.projectName,
          customerName: formData.customerName,
          // Always submit logged-in identity values from profile-prefilled form state.
          email: formData.email,
          phone: formData.phone,
          description: formData.customizationDetails,
          endDate: normalizeDueDate(formData.dueDate),
          status: "ongoing"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUiMessageType("success");
      setUiMessage("Project customization request submitted successfully.");

      setFormData({
        customerId: formData.customerId,
        projectName: "",
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        customizationDetails: "",
        dueDate: "",
      });

    } catch (error) {

      console.error("Error submitting project:", error);

      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong!";

      setUiMessageType("error");
      setUiMessage(errorMsg);

    } finally {

      setLoading(false);

    }
  };



  return (

    <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-start">

      {uiMessage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-10 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5 text-center">
            <p className={`text-sm font-semibold ${uiMessageType === "success" ? "text-green-700" : "text-red-700"}`}>
              {uiMessage}
            </p>
            <button
              type="button"
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setUiMessage("")}
            >
              OK
            </button>
          </div>
        </div>
      )}

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



          {/* Email */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
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