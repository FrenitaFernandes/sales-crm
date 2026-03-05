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

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setTickets([]);
        return;
      }

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
          _id: item._id,
          id: item.ticketId || `TCK-${String(item._id).slice(-4).toUpperCase()}`,
          subject: item.subject || item.title || "Support Request",
          category: item.category || "General",
          priority: item.priority || "Medium",
          status: item.status || "Pending",
          date: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "-",
          enableChat: !!item.enableChat,
        }));

      setTickets(rows);
    } catch (error) {
      console.error("Fetch tickets error:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(fetchTickets, 10000);
    const onFocus = () => fetchTickets();

    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const openChat = async (ticket) => {
    if (!ticket?.enableChat) return;

    try {
      setActiveChat(ticket);
      setChatError("");
      setChatLoading(true);
      const token = getToken();

      const res = await axios.get(`http://localhost:5000/api/services/${ticket._id}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatMessages(res.data?.data || []);
    } catch (error) {
      setChatMessages([]);
      setChatError(error?.response?.data?.message || "Failed to load chat");
    } finally {
      setChatLoading(false);
    }
  };

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
            {loading ? (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">Loading tickets...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">No tickets found.</td>
              </tr>
            ) : tickets.map((t, idx) => (
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
                          : t.status === "In Progress" || t.status === "Pending"
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

                  {t.enableChat && (
                    <button
                      className="px-3 py-1 bg-gray-200 rounded flex items-center gap-1 inline-flex"
                      onClick={() => openChat(t)}
                      title="Open chat"
                    >
                      <MessageCircle size={16} /> Chat
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {activeChat && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold text-sm">Chat - {activeChat.subject}</h3>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveChat(null)}>
                Close
              </button>
            </div>

            <div className="p-3" style={{ maxHeight: "340px", overflowY: "auto" }}>
              {chatLoading ? (
                <p className="text-sm text-gray-500">Loading chat...</p>
              ) : chatMessages.length === 0 ? (
                <p className="text-sm text-gray-500">No messages yet.</p>
              ) : (
                <div className="space-y-2">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`p-2 rounded text-sm ${msg.senderRole === "customer" ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"}`}
                    >
                      <div className="font-semibold">{msg.senderName}</div>
                      <div>{msg.message}</div>
                    </div>
                  ))}
                </div>
              )}

              {chatError && <p className="text-danger text-sm mt-2">{chatError}</p>}
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Type message"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
              />
              <button className="btn btn-primary" onClick={sendChatMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;