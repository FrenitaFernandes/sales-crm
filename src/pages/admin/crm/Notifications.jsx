import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState({});

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

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
    </div>
  );
}
