import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState({});
  const [allowingChatId, setAllowingChatId] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [actionType, setActionType] = useState("info");
  const [actionDetail, setActionDetail] = useState("");

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";
  const getErrorMessage = (error) =>
    error?.response?.data?.message || error?.message || "Unable to allow chat";

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setNotifications([]);
        return;
      }

      const res = await axios.get("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows = (res.data?.data || [])
        .filter((item) => item?.isRead !== true)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(rows);
    } catch (error) {
      console.error("Fetch admin notifications error:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = getToken();
      await axios.put(
        `http://localhost:5000/api/services/${id}`,
        { isRead: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => prev.filter((item) => item._id !== id));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  };

  const allowChat = async (id) => {
    try {
      setActionStatus("");
      setActionType("info");
      setActionDetail("");
      setAllowingChatId(id);
      const token = getToken();

      try {
        await axios.put(
          `http://localhost:5000/api/services/${id}/allow-chat`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (primaryError) {
        await axios.put(
          `http://localhost:5000/api/services/${id}`,
          { enableChat: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                enableChat: true,
              }
            : item
        )
      );
      setActionStatus("chat allowed");
      setActionType("success");
      setActionDetail("");
      fetchNotifications();
    } catch (error) {
      console.error("Allow chat error:", error);
      setActionStatus("failed");
      setActionType("error");
      setActionDetail(getErrorMessage(error));
    } finally {
      setAllowingChatId("");
    }
  };

  const openChat = async (item) => {
    if (!item?.enableChat) return;

    try {
      setActiveChat(item);
      setChatError("");
      setChatLoading(true);
      const token = getToken();

      const res = await axios.get(`http://localhost:5000/api/services/${item._id}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatMessages(res.data?.data || []);
    } catch (error) {
      setChatError(error?.response?.data?.message || "Failed to load chat");
      setChatMessages([]);
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

  const getNotificationStatus = (item) => {
    const current = notificationStatus[item._id];
    if (current) return current;

    const statusValue = (item?.status || "").toLowerCase();
    return ["completed", "resolved", "closed", "done"].includes(statusValue)
      ? "completed"
      : "ongoing";
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Notifications</h2>
      {actionStatus && (
        <>
          <p className={`text-sm mt-2 ${actionType === "success" ? "text-success" : "text-danger"}`}>
            {actionStatus}
          </p>
          {actionType === "error" && actionDetail && (
            <p className="text-danger text-xs mt-1">{actionDetail}</p>
          )}
        </>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {notifications.map((item) => (
            <div key={item._id} className="bg-white border rounded-lg p-3 flex justify-between items-start gap-3">
              <div>
                <p className="font-semibold text-sm">{item.subject || item.title || "Support Request"}</p>
                <p className="text-xs text-gray-600">
                  {item.customerId?.name || "Customer"} • {item.category || "General"}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.description || "No details"}</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  value={getNotificationStatus(item)}
                  onChange={(e) =>
                    setNotificationStatus((prev) => ({
                      ...prev,
                      [item._id]: e.target.value,
                    }))
                  }
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => allowChat(item._id)}
                  disabled={item.enableChat || allowingChatId === item._id}
                >
                  {item.enableChat ? "Chat Allowed" : allowingChatId === item._id ? "Allowing..." : "Allow Chat"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => openChat(item)}
                  disabled={!item.enableChat}
                >
                  Chat
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => markAsRead(item._id)}
                >
                  Mark Read
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeChat && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-3 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm">Chat - {activeChat.subject || activeChat.title || "Support Request"}</h3>
              </div>
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
                      className={`p-2 rounded text-sm ${msg.senderRole === "admin" ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"}`}
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
