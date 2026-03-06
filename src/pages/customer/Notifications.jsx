import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import axios from "axios";
import {
  getCustomerNotifications,
  markAllCustomerNotificationsRead,
  removeCustomerNotification,
} from "../../utils/customerNotifications";

function Notifications() {
  const [notifs, setNotifs] = useState([]);

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  const loadNotifications = async () => {
    const localItems = getCustomerNotifications().map((item) => ({
      ...item,
      _id: String(item?._id || item?.eventId || Date.now()),
      source: "local",
    }));

    let backendItems = [];

    try {
      const token = getToken();
      if (token) {
        const res = await axios.get("http://localhost:5000/api/customer/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        backendItems = (res.data?.data || []).map((item) => ({
          ...item,
          _id: String(item?._id || ""),
          source: "backend",
        }));
      }
    } catch (error) {
      console.error("Error loading backend notifications:", error);
    }

    const merged = [...backendItems, ...localItems].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    setNotifs(merged);
  };

  useEffect(() => {
    const syncRead = async () => {
      // Clear unread local badge.
      markAllCustomerNotificationsRead();

      // Mark backend unread notifications as read when page is opened.
      try {
        const token = getToken();
        if (token) {
          const res = await axios.get("http://localhost:5000/api/customer/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const unreadBackend = (res.data?.data || []).filter((item) => item?.read !== true);
          await Promise.all(
            unreadBackend.map((item) =>
              axios.put(
                `http://localhost:5000/api/customer/notifications/${item._id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              )
            )
          );
        }
      } catch (error) {
        console.error("Error marking backend notifications read:", error);
      }

      await loadNotifications();
      window.dispatchEvent(new Event("notifications-updated"));
    };

    syncRead();
  }, []);

  const handleRemove = (id) => {
    const updated = removeCustomerNotification(id);
    // Refresh merged list after local deletion.
    const backendItems = notifs.filter((item) => item?.source === "backend");
    const localItems = updated.map((item) => ({ ...item, source: "local" }));
    setNotifs([...backendItems, ...localItems]);
    window.dispatchEvent(new Event("notifications-updated"));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold flex gap-2 items-center">
        <Bell /> Notifications
      </h1>

      <div className="mt-6 space-y-4">
        {notifs.length === 0 ? (
          <div className="p-4 shadow rounded-xl bg-gray-50 text-gray-500 text-sm">
            No notifications yet.
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n._id}
              className={`p-4 shadow rounded-xl flex justify-between gap-3 ${n.read ? "bg-gray-100" : "bg-blue-50"}`}
            >
              <div>
                <h3 className="font-semibold text-sm">{n.title}</h3>
                <p className="text-gray-600 text-sm">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                </p>
              </div>

              <div>
                {n.source === "local" && (
                  <button
                    type="button"
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
                    onClick={() => handleRemove(n._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
