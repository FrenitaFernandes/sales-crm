import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  getCustomerNotifications,
  markAllCustomerNotificationsRead,
  removeCustomerNotification,
} from "../../utils/customerNotifications";

function Notifications() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    const all = getCustomerNotifications();
    setNotifs(all);

    // Requirement: unread count should clear once notifications page is opened.
    const updated = markAllCustomerNotificationsRead();
    setNotifs(updated);
    window.dispatchEvent(new Event("notifications-updated"));
  }, []);

  const handleRemove = (id) => {
    const updated = removeCustomerNotification(id);
    setNotifs(updated);
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
            <div key={n._id} className={`p-4 shadow rounded-xl flex justify-between gap-3 ${n.read ? "bg-gray-100" : "bg-blue-50"}`}>
              <div>
                <h3 className="font-semibold text-sm">{n.title}</h3>
                <p className="text-gray-600 text-sm">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
                  onClick={() => handleRemove(n._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;