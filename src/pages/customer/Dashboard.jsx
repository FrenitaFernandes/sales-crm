import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, FileText, Bell, Ticket, User } from "lucide-react";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("/api/customer/dashboard")
      .then(res => setStats(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold flex gap-2 items-center">
        <BarChart3 /> Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white shadow rounded-xl">
          <p className="text-gray-500">Invoices</p>
          <p className="text-2xl font-bold">{stats?.invoiceCount || 0}</p>
        </div>
        <div className="p-5 bg-white shadow rounded-xl">
          <p className="text-gray-500">Notifications</p>
          <p className="text-2xl font-bold">{stats?.notifications || 0}</p>
        </div>
        <div className="p-5 bg-white shadow rounded-xl">
          <p className="text-gray-500">Active Tickets</p>
          <p className="text-2xl font-bold">{stats?.activeTickets || 0}</p>
        </div>
        <div className="p-5 bg-white shadow rounded-xl">
          <p className="text-gray-500">Profile Completion</p>
          <p className="text-2xl font-bold">{stats?.profileCompletion || "80%"}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
          <Bell /> Recent Activity
        </h2>

        <ul className="space-y-3">
          {(stats?.activity || []).map((item, i) => (
            <li key={i} className="border-b pb-2">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;