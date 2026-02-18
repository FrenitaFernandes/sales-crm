import React, { useEffect, useMemo, useState } from "react";
import { FaUsers, FaClipboardList, FaCheckCircle, FaSpinner } from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_BASE = "http://localhost:5000/api/admin";

function formatDateLabel(yyyyMMdd) {
  const d = new Date(yyyyMMdd);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

export default function Dashboard() {
  const [data, setData] = useState({
    totalCustomers: 0,
    totalServiceRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    completedRequests: 0,
    trend: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/analytics`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.log("Dashboard analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const pieData = useMemo(() => {
    return [
      { name: "Pending", value: data.pendingRequests || 0 },
      { name: "In Progress", value: data.inProgressRequests || 0 },
      { name: "Completed", value: data.completedRequests || 0 },
    ];
  }, [data]);

  const trendData = useMemo(() => {
    const days = 7;
    const map = new Map();
    (data.trend || []).forEach((t) => map.set(t._id, t.count));

    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      result.push({
        date: formatDateLabel(key),
        count: map.get(key) || 0,
      });
    }
    return result;
  }, [data]);

  const pieColors = ["#f59e0b", "#3b82f6", "#22c55e"]; // yellow, blue, green

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Admin CRM Dashboard</h2>
          <p className="text-gray-500 text-sm">
            Business overview of customers and service request performance.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="/admin/crm/customer-details"
            className="bg-gray-900 text-white px-4 py-2 rounded shadow hover:bg-black"
          >
            Customers
          </a>
          <a
            href="/admin/crm/service-requests"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Service Requests
          </a>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow rounded-xl p-4 flex gap-4 items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-700 text-xl">
                <FaUsers />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Customers</p>
                <h3 className="text-2xl font-bold">{data.totalCustomers}</h3>
              </div>
            </div>

            <div className="bg-white shadow rounded-xl p-4 flex gap-4 items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-700 text-xl">
                <FaClipboardList />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Requests</p>
                <h3 className="text-2xl font-bold">{data.totalServiceRequests}</h3>
              </div>
            </div>

            <div className="bg-white shadow rounded-xl p-4 flex gap-4 items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-700 text-xl">
                <FaSpinner />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <h3 className="text-2xl font-bold">{data.pendingRequests}</h3>
              </div>
            </div>

            <div className="bg-white shadow rounded-xl p-4 flex gap-4 items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-700 text-xl">
                <FaCheckCircle />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <h3 className="text-2xl font-bold">{data.completedRequests}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white shadow rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Status Distribution</h3>
                <span className="text-xs text-gray-500">Pending / In Progress / Completed</span>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={entry.name} fill={pieColors[idx]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white shadow rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Requests Trend</h3>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-5 mt-2">
            <h3 className="font-bold text-lg mb-2">Quick Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded bg-gray-50">
                <p className="text-gray-500">In Progress</p>
                <p className="text-xl font-bold">{data.inProgressRequests}</p>
              </div>

              <div className="p-3 rounded bg-gray-50">
                <p className="text-gray-500">Completion Rate</p>
                <p className="text-xl font-bold">
                  {data.totalServiceRequests === 0
                    ? "0%"
                    : Math.round((data.completedRequests / data.totalServiceRequests) * 100) + "%"}
                </p>
              </div>

              <div className="p-3 rounded bg-gray-50">
                <p className="text-gray-500">Pending Ratio</p>
                <p className="text-xl font-bold">
                  {data.totalServiceRequests === 0
                    ? "0%"
                    : Math.round((data.pendingRequests / data.totalServiceRequests) * 100) + "%"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
