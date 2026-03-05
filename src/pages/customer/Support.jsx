import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

function Support() {
  const [form, setForm] = useState({
    subject: "",
    category: "",
    message: "",
  });
  const [previousRequests, setPreviousRequests] = useState([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  const fetchMyRequests = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const myEmail = String(user?.email || "").toLowerCase();

      const res = await axios.get("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows = (res.data?.data || [])
        .filter((item) => {
          const email = String(item?.customerId?.email || "").toLowerCase();
          return myEmail ? email === myEmail : true;
        })
        .map((item) => ({
          id: item._id,
          subject: item.subject || item.title || "Support Request",
          category: item.category || "General",
          date: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "-",
          status: item.status || "Pending",
        }));

      setPreviousRequests(rows);
    } catch (error) {
      console.error("Fetch support requests error:", error);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const resolveCustomerId = async (token) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmail = String(user?.email || "").trim().toLowerCase();
    const userName = String(user?.name || "").trim();

    if (!userEmail && !userName) return "";

    const customersRes = await axios.get("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const customers = customersRes?.data?.data || [];

    let customer = null;

    if (userEmail) {
      customer = customers.find((item) => String(item?.email || "").trim().toLowerCase() === userEmail);
    }

    if (!customer && userName) {
      customer = customers.find((item) => String(item?.name || "").trim().toLowerCase() === userName.toLowerCase());
    }

    if (customer?._id) {
      return customer._id;
    }

    const createPayload = {
      name: userName || "Customer",
      email: userEmail || undefined,
      status: "Active",
    };

    const createdRes = await axios.post("http://localhost:5000/api/customers", createPayload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return createdRes?.data?.data?._id || "";
  };

  const submitForm = async () => {
    setSubmitMessage("");
    setSubmitError("");

    if (!form.subject || !form.category || !form.message) {
      setSubmitError("Please fill all fields");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setSubmitError("Please login again");
        return;
      }

      const customerId = await resolveCustomerId(token);
      if (!customerId) {
        setSubmitError("Customer profile not found");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/services",
        {
          customerId,
          subject: form.subject,
          title: form.subject,
          category: form.category,
          description: form.message,
          priority: "Medium",
          status: "Pending",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubmitMessage("Support request submitted successfully!");
      setForm({ subject: "", category: "", message: "" });
      fetchMyRequests();
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Failed to submit support request");
    }
  };

  return (
    <div className="p-6 space-y-10">

      {/* Page Title */}
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <MessageCircle /> Support
      </h1>

      {/* Support Form */}
      <div className="bg-white shadow rounded-xl p-6 space-y-5">

        <h2 className="text-lg font-semibold">Submit a Support Request</h2>

        {submitMessage && (
          <div className="alert alert-success py-2 mb-0">{submitMessage}</div>
        )}

        {submitError && (
          <div className="alert alert-danger py-2 mb-0">{submitError}</div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="p-3 border rounded w-full"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          <select
            className="p-3 border rounded w-full text-gray-600"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Technical">Technical</option>
            <option value="Billing">Billing</option>
            <option value="Account">Account</option>
          </select>
        </div>

        <textarea
          placeholder="Describe your issue…"
          className="p-3 border rounded w-full h-32"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />

        <button
          onClick={submitForm}
          className="bg-blue-600 text-white px-5 py-2 rounded flex items-center gap-2"
        >
          <Send size={18} /> Submit Request
        </button>

      </div>

      {/* Previous Support Requests */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Previous Requests</h2>

        <div className="space-y-3">

          {previousRequests.length === 0 && (
            <div className="text-gray-500 text-sm">No previous requests found.</div>
          )}

          {previousRequests.map((req, idx) => (
            <div
              key={idx}
              className="border rounded-xl p-4 flex justify-between hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold">{req.subject}</p>
                <p className="text-gray-500 text-sm">{req.category}</p>
                <p className="text-gray-400 text-sm">{req.date}</p>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 h-fit text-sm rounded-full
                  ${
                    req.status === "Resolved" || req.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : req.status === "Pending" || req.status === "In Progress" || req.status === "Open"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-300 text-gray-700"
                  }
                `}
              >
                {req.status}
              </span>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}

export default Support;