import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, Bell, Megaphone } from "lucide-react";

function Dashboard() {

  const [stats, setStats] = useState(null);
  const [ads, setAds] = useState([]);

  useEffect(() => {

    // Dashboard stats
    axios.get("/api/customer/dashboard")
      .then(res => setStats(res.data))
      .catch(err => console.log(err));

    // Recommended advertisements
    axios.get("/api/customer/advertisements")
      .then(res => setAds(res.data || []))
      .catch(err => console.log(err));

  }, []);

  return (

    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-semibold flex gap-2 items-center">
        <BarChart3 /> Dashboard
      </h1>

      {/* STATS CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="p-5 bg-white shadow rounded-xl">
          <p className="text-gray-500">Invoices</p>
          <p className="text-2xl font-bold">
            {stats?.invoiceCount || 0}
          </p>
        </div>

        <div className="p-5 bg-white shadow rounded-xl">
          <p className="text-gray-500">Notifications</p>
          <p className="text-2xl font-bold">
            {stats?.notifications || 0}
          </p>
        </div>

        <div className="p-5 bg-white shadow rounded-xl">
          <p className="text-gray-500">Active Tickets</p>
          <p className="text-2xl font-bold">
            {stats?.activeTickets || 0}
          </p>
        </div>

        <div className="p-5 bg-white shadow rounded-xl">
          <p className="text-gray-500">Profile Completion</p>
          <p className="text-2xl font-bold">
            {stats?.profileCompletion || "80%"}
          </p>
        </div>

      </div>


      {/* RECOMMENDED ADVERTISEMENTS */}

      <div className="bg-white p-6 shadow rounded-xl">

        <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
          <Megaphone /> Recommended For You
        </h2>

        {ads.length === 0 ? (

          <p className="text-gray-500">
            No advertisements available for your profile.
          </p>

        ) : (

          <div className="grid md:grid-cols-3 gap-4">

            {ads.map((ad, i) => (

              <div
                key={i}
                className="border rounded-xl p-4 hover:shadow-lg transition"
              >

                {ad.thumbnail && (
                  <img
                    src={ad.thumbnail}
                    alt={ad.productName}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}

                <h3 className="font-bold text-lg">
                  {ad.productName}
                </h3>

                <p className="text-gray-600 text-sm mb-2">
                  {ad.tagline}
                </p>

                <p className="text-gray-500 text-sm mb-3">
                  {ad.description}
                </p>

                {ad.productLink && (
                  <a
                    href={ad.productLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    View Product
                  </a>
                )}

              </div>

            ))}

          </div>

        )}

      </div>


      {/* RECENT ACTIVITY */}

      <div className="bg-white p-6 shadow rounded-xl">

        <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
          <Bell /> Recent Activity
        </h2>

        <ul className="space-y-3">

          {(stats?.activity || []).map((item, i) => (

            <li key={i} className="border-b pb-2">
              {item}
            </li>

          ))}

        </ul>

      </div>

    </div>
  );
}

export default Dashboard;