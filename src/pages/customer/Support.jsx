import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";

function Support() {
  const [form, setForm] = useState({
    subject: "",
    category: "",
    message: "",
  });

  // Dummy previous support messages (no backend)
  const previousRequests = [
    {
      id: "REQ-101",
      subject: "Need help changing email",
      category: "Account",
      date: "2024-01-14",
      status: "Resolved",
    },
    {
      id: "REQ-102",
      subject: "Billing amount mismatch",
      category: "Billing",
      date: "2024-01-10",
      status: "Pending",
    },
    {
      id: "REQ-103",
      subject: "Issue with login sessions",
      category: "Technical",
      date: "2023-12-20",
      status: "Closed",
    },
  ];

  const submitForm = () => {
    if (!form.subject || !form.category || !form.message) {
      alert("Please fill all fields");
      return;
    }

    alert("Support request submitted! (Frontend only)");
    setForm({ subject: "", category: "", message: "" });
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
                    req.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : req.status === "Pending"
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