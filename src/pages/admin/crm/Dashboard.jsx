import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalServiceRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/crm/Dashboard");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg shadow bg-white">
          <p className="text-gray-500">Total Customers</p>
          <h3 className="text-2xl font-bold">{stats.totalCustomers}</h3>
        </div>

        <div className="p-4 rounded-lg shadow bg-white">
          <p className="text-gray-500">Total Service Requests</p>
          <h3 className="text-2xl font-bold">{stats.totalServiceRequests}</h3>
        </div>

        <div className="p-4 rounded-lg shadow bg-white">
          <p className="text-gray-500">Pending Requests</p>
          <h3 className="text-2xl font-bold">{stats.pendingRequests}</h3>
        </div>

        <div className="p-4 rounded-lg shadow bg-white">
          <p className="text-gray-500">Completed Requests</p>
          <h3 className="text-2xl font-bold">{stats.completedRequests}</h3>
        </div>
      </div>
    </div>
  );
}
