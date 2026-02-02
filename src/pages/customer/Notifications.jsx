import axios from "axios";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

function Notifications() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    axios.get("/api/customer/notifications")
      .then(res => setNotifs(res.data))
      .catch(err => console.error(err));
  }, []);

  const markRead = async (id) => {
    await axios.put(`/api/customer/notifications/${id}/read`);
    setNotifs(notifs.map(n => n._id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold flex gap-2 items-center">
        <Bell /> Notifications
      </h1>

      <div className="mt-6 space-y-4">
        {notifs.map((n) => (
          <div key={n._id} className={`p-4 shadow rounded-xl flex justify-between
            ${n.read ? "bg-gray-100" : "bg-blue-50"}`}>
            <div>
              <h3 className="font-semibold">{n.title}</h3>
              <p className="text-gray-600">{n.message}</p>
            </div>

            {!n.read && (
              <button
                onClick={() => markRead(n._id)}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;