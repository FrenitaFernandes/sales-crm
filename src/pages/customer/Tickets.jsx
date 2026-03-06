import { Ticket, Eye, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

function Tickets() {

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);

  const getToken = () =>
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    "";

  const customerId = localStorage.getItem("customerId");

  // FETCH TICKETS
  const fetchTickets = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const res = await axios.get(
        `http://localhost:5000/api/service-requests/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTickets(res.data?.data || []);
    } catch (error) {
      console.error("Fetch tickets error:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [customerId]);

  // AUTO REFRESH
  useEffect(() => {
    const intervalId = setInterval(fetchTickets, 10000);

    const onFocus = () => fetchTickets();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // OPEN CHAT
  const openChat = async (ticket) => {
    if (!ticket?.enableChat) return;

    try {
      setActiveChat(ticket);
      setChatError("");
      setChatLoading(true);

      const token = getToken();

      const res = await axios.get(
        `http://localhost:5000/api/services/${ticket._id}/chat`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChatMessages(res.data?.data || []);
    } catch (error) {
      setChatMessages([]);
      setChatError(error?.response?.data?.message || "Failed to load chat");
    } finally {
      setChatLoading(false);
    }
  };

  // SEND MESSAGE
  const sendChatMessage = async () => {
    if (!activeChat?._id) return;

    const message = chatInput.trim();
    if (!message) return;

    try {
      setChatError("");

      const token = getToken();

      const res = await axios.post(
        `http://localhost:5000/api/services/${activeChat._id}/chat`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.data) {
        setChatMessages((prev) => [...prev, res.data.data]);
      }

      setChatInput("");
    } catch (error) {
      setChatError(error?.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Ticket /> Tickets
      </h1>

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
            {loading ? (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">

                  <td className="p-3">{t.ticketId}</td>

                  <td className="p-3 max-w-sm truncate">
                    {t.title || t.subject}
                  </td>

                  <td className="p-3">{t.category}</td>

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

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-sm rounded-full
                      ${
                        t.status === "Open"
                          ? "bg-green-100 text-green-700"
                          : t.status === "In Progress" || t.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="p-3">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-right space-x-2">

                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 inline-flex"
                    >
                      <Eye size={16} /> View
                    </button>

                    {t.enableChat && (
                      <button
                        className="px-3 py-1 bg-gray-200 rounded flex items-center gap-1 inline-flex"
                        onClick={() => openChat(t)}
                      >
                        <MessageCircle size={16} /> Chat
                      </button>
                    )}

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CHAT MODAL */}

      {activeChat && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">

            <div className="p-3 border-b flex justify-between">
              <h3 className="font-semibold text-sm">
                Chat - {activeChat.title || activeChat.subject}
              </h3>

              <button onClick={() => setActiveChat(null)}>
                Close
              </button>
            </div>

            <div className="p-3 max-h-[340px] overflow-y-auto">

              {chatLoading ? (
                <p className="text-sm text-gray-500">Loading chat...</p>
              ) : chatMessages.length === 0 ? (
                <p className="text-sm text-gray-500">No messages yet.</p>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`p-2 rounded text-sm mb-2 ${
                      msg.senderRole === "customer"
                        ? "bg-blue-100 ml-8"
                        : "bg-gray-100 mr-8"
                    }`}
                  >
                    <div className="font-semibold">
                      {msg.senderName}
                    </div>
                    <div>{msg.message}</div>
                  </div>
                ))
              )}

              {chatError && (
                <p className="text-red-500 text-sm mt-2">
                  {chatError}
                </p>
              )}
            </div>

            <div className="p-3 border-t flex gap-2">

              <input
                type="text"
                className="border p-2 w-full rounded"
                placeholder="Type message"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendChatMessage();
                  }
                }}
              />

              <button
                className="bg-blue-600 text-white px-4 rounded"
                onClick={sendChatMessage}
              >
                Send
              </button>

            </div>

          </div>

        </div>
      )}

      {/* VIEW TICKET */}

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-[500px]">

            <h2 className="text-lg font-semibold mb-4">
              Ticket Details
            </h2>

            <p><b>Ticket ID:</b> {selectedTicket.ticketId}</p>
            <p><b>Subject:</b> {selectedTicket.title}</p>
            <p><b>Category:</b> {selectedTicket.category}</p>
            <p><b>Description:</b> {selectedTicket.description}</p>
            <p><b>Priority:</b> {selectedTicket.priority}</p>
            <p><b>Status:</b> {selectedTicket.status}</p>

            {selectedTicket.uploadedImage && (
              <img
                src={`http://localhost:5000${selectedTicket.uploadedImage}`}
                alt="attachment"
                className="mt-3 max-h-60 border rounded"
              />
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