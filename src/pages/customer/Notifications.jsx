import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import axios from "axios";
import {
  dismissCustomerNotification,
  getDismissedCustomerNotificationIds,
  getCustomerNotifications,
  markAllCustomerNotificationsRead,
  removeCustomerNotification,
} from "../../utils/customerNotifications";

function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [activeAd, setActiveAd] = useState(null);

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  const isAdvertisementNotification = (item) => {
    const type = String(item?.type || "").trim().toLowerCase();
    return type === "advertisement" || !!resolveNotificationImage(item?.image);
  };

  const isInvoiceNotification = (item) => {
    const type = String(item?.type || "").trim().toLowerCase();
    const title = String(item?.title || "").trim();
    return type === "order" || /^invoice\b/i.test(title);
  };

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

    const dismissedIds = getDismissedCustomerNotificationIds();
    const filteredBackendItems = backendItems.filter(
      (item) => !dismissedIds.has(String(item?._id || ""))
    );

    const merged = [...filteredBackendItems, ...localItems].sort(
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

  const handleDismissBackendNotification = (id) => {
    const notificationId = String(id || "").trim();
    if (!notificationId) return;

    dismissCustomerNotification(notificationId);
    setNotifs((prev) => prev.filter((item) => String(item?._id || "") !== notificationId));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const resolveNotificationImage = (raw) => {
    const val = String(raw || "").trim();
    if (!val) return "";
    if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/")) return val;
    if (val.startsWith("/")) return val;
    return `/${val}`;
  };

  const getNotificationTitle = (title) => {
    const text = String(title || "").trim();
    return text.replace(/^New Product:\s*/i, "") || text;
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
                <h3 className="font-semibold text-sm">{getNotificationTitle(n.title)}</h3>
                <p className="text-gray-600 text-sm">{n.message}</p>
                {resolveNotificationImage(n.image) && (
                  <button
                    type="button"
                    className="mt-2 p-0 border-0 bg-transparent"
                    onClick={() => setActiveAd(n)}
                    title="Open advertisement"
                  >
                    <img
                      src={resolveNotificationImage(n.image)}
                      alt="Advertisement"
                      className="rounded"
                      style={{ width: "170px", height: "96px", objectFit: "cover", cursor: "zoom-in" }}
                    />
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                </p>
              </div>

              <div>
                {(n.source === "local" || isAdvertisementNotification(n) || isInvoiceNotification(n)) && (
                  <button
                    type="button"
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
                    onClick={() =>
                      n.source === "local"
                        ? handleRemove(n._id)
                        : handleDismissBackendNotification(n._id)
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {activeAd && resolveNotificationImage(activeAd.image) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-base font-semibold">{getNotificationTitle(activeAd.title) || "Advertisement"}</h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                onClick={() => setActiveAd(null)}
                aria-label="Close advertisement preview"
              >
                x
              </button>
            </div>

            <div className="p-4">
              <img
                src={resolveNotificationImage(activeAd.image)}
                alt={activeAd.title || "Advertisement"}
                className="w-full rounded"
                style={{ maxHeight: "70vh", objectFit: "contain" }}
              />
              {activeAd.message && (
                <p className="mt-3 text-sm text-gray-700">{activeAd.message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
