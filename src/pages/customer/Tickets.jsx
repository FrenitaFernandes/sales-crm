import { Ticket, Eye, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

function Tickets() {

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const customerId = localStorage.getItem("customerId");

  useEffect(() => {
    fetch(`http://localhost:5000/api/service-requests/customer/${customerId}`)
      .then(res => res.json())
      .then(data => setTickets(data.data || []))
      .catch(err => console.log(err));
  }, [customerId]);

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

                <td className="p-3">{t.ticketId}</td>

                <td className="p-3 max-w-sm truncate">
                  {t.title}
                </td>

                <td className="p-3">{t.category}</td>

                {/* Priority */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm rounded-full
                      ${
                        t.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : t.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {t.priority}
                  </span>
                </td>

                {/* Status */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm rounded-full
                      ${
                        t.status === "Open"
                          ? "bg-green-100 text-green-700"
                          : t.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-300 text-gray-700"
                      }`}
                  >
                    {t.status}
                  </span>
                </td>

                {/* Date */}
                <td className="p-3">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="p-3 text-right space-x-2">

                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 inline-flex"
                  >
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

      {/* View Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-[500px]">

            <h2 className="text-lg font-semibold mb-4">Ticket Details</h2>

            <p><b>Ticket ID:</b> {selectedTicket.ticketId}</p>
            <p><b>Subject:</b> {selectedTicket.title}</p>
            <p><b>Category:</b> {selectedTicket.category}</p>
            <p><b>Description:</b> {selectedTicket.description}</p>
            <p><b>Priority:</b> {selectedTicket.priority}</p>
            <p><b>Status:</b> {selectedTicket.status}</p>

            {selectedTicket.uploadedImage && (
              <div className="mt-3">
                <p className="font-medium">Attachment</p>
                <img
                  src={`http://localhost:5000${selectedTicket.uploadedImage}`}
                  alt="attachment"
                  className="mt-2 max-h-60 rounded border"
                />
              </div>
            )}

            <button
              onClick={() => setSelectedTicket(null)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Tickets;