import { Ticket, Eye, MessageCircle } from "lucide-react";
import { useState } from "react";

function Tickets() {

  // Dummy Ticket Data (Frontend Only)
  const [tickets] = useState([
    {
      id: "TCK-2001",
      subject: "Login issue — cannot access account",
      category: "Technical",
      priority: "High",
      status: "Open",
      date: "2024-01-14",
    },
    {
      id: "TCK-2002",
      subject: "Payment not reflecting in dashboard",
      category: "Billing",
      priority: "Medium",
      status: "In Progress",
      date: "2024-01-10",
    },
    {
      id: "TCK-2003",
      subject: "Need help updating company details",
      category: "Account",
      priority: "Low",
      status: "Closed",
      date: "2023-12-25",
    },
  ]);

  return (
    <div className="p-6 space-y-6">

      {/* Page Title */}
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Ticket /> Tickets
      </h1>

      {/* Tickets Table */}
      <div className="bg-white p-6 shadow rounded-xl">

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3 text-left">Ticket ID</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition">

                <td className="p-3">{t.id}</td>
                <td className="p-3 max-w-sm truncate">{t.subject}</td>
                <td className="p-3">{t.category}</td>

                {/* Priority Badge */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm rounded-full
                      ${
                        t.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : t.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    `}
                  >
                    {t.priority}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm rounded-full
                      ${
                        t.status === "Open"
                          ? "bg-green-100 text-green-700"
                          : t.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-300 text-gray-700"
                      }
                    `}
                  >
                    {t.status}
                  </span>
                </td>

                <td className="p-3">{t.date}</td>

                {/* Action Buttons */}
                <td className="p-3 text-right space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 inline-flex">
                    <Eye size={16} /> View
                  </button>

                  <button className="px-3 py-1 bg-gray-200 rounded flex items-center gap-1 inline-flex">
                    <MessageCircle size={16} /> Chat
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default Tickets;