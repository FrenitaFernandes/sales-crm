import axios from "axios";
import { useEffect, useState } from "react";
import { Bell, Megaphone } from "lucide-react";

function Notifications() {

  const [notifs, setNotifs] = useState([]);

  useEffect(() => {

    axios.get("/api/customer/notifications")
      .then(res => setNotifs(res.data || []))
      .catch(err => console.error(err));

  }, []);


  const markRead = async (id) => {

    try {

      await axios.put(`/api/customer/notifications/${id}/read`);

      setNotifs(
        notifs.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      );

    } catch (err) {
      console.error(err);
    }

  };


  return (

    <div className="p-6">

      <h1 className="text-2xl font-semibold flex gap-2 items-center">
        <Bell /> Notifications
      </h1>


      {/* EMPTY STATE */}

      {notifs.length === 0 && (
        <div className="mt-6 text-gray-500">
          No notifications available.
        </div>
      )}


      {/* NOTIFICATION LIST */}

      <div className="mt-6 space-y-4">

        {notifs.map((n) => (

          <div
            key={n._id}
            className={`p-4 shadow rounded-xl flex justify-between items-center
            ${n.read ? "bg-gray-100" : "bg-blue-50"}`}
          >

            <div className="flex gap-3 items-start">

              {/* ICON */}

              {n.type === "advertisement" ? (
                <Megaphone className="text-blue-600" size={20} />
              ) : (
                <Bell className="text-gray-600" size={20} />
              )}


              <div>

                <h3 className="font-semibold">
                  {n.title}
                </h3>

                <p className="text-gray-600">
                  {n.message}
                </p>


                {/* VIEW PRODUCT BUTTON */}

                {n.type === "advertisement" && n.productLink && (

                  <a
                    href={n.productLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    View Product
                  </a>

                )}

              </div>

            </div>


            {/* MARK READ BUTTON */}

            {!n.read && (

              <button
                onClick={() => markRead(n._id)}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
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