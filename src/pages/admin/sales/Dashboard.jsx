import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

/* ---------- DATA ---------- */

const leadSourceData = [
  { name: "Google", value: 40 },
  { name: "Facebook", value: 30 },
  { name: "Instagram", value: 20 },
  { name: "LinkedIn", value: 10 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const trendData = [
  { month: "Jan", leads: 120, converted: 40 },
  { month: "Feb", leads: 90, converted: 35 },
  { month: "Mar", leads: 140, converted: 50 },
  { month: "Apr", leads: 160, converted: 65 },
  { month: "May", leads: 110, converted: 30 },
];

const summaryData = [
  { name: "Jan", google: 40, facebook: 30, instagram: 20, linkedin: 10 },
  { name: "Feb", google: 35, facebook: 25, instagram: 15, linkedin: 8 },
  { name: "Mar", google: 50, facebook: 40, instagram: 30, linkedin: 18 },
];

const stockRemaining = 340;

/* ---------- COMPONENT ---------- */

const Dashboard = () => {
  return (
    <>
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold mb-5">Sales Dashboard</h1>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          ["Total Leads", 120],
          ["Follow-ups Today", 15],
          ["Converted Leads", 40],
          ["Stock Remaining", stockRemaining],
          ["Pending Tasks", 12],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-3 rounded shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <h2 className="text-lg font-bold">{value}</h2>
          </div>
        ))}
      </div>

      {/* PIE + LINE CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* PIE CHART */}
        <div className="bg-white p-3 rounded shadow-sm">
          <h2 className="text-base font-semibold mb-2">Lead Sources</h2>

          <div className="flex justify-center">
            <PieChart width={260} height={200}>
              <Pie
                data={leadSourceData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {leadSourceData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* LINE CHART */}
        <div className="bg-white p-3 rounded shadow-sm">
          <h2 className="text-base font-semibold mb-2">Monthly Lead Trend</h2>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="converted"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* SUMMARY BAR CHART */}
      <div className="bg-white p-3 rounded shadow-sm">
        <h2 className="text-base font-semibold mb-2">Summary Overview</h2>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={summaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="google" fill="#3b82f6" barSize={22} />
            <Bar dataKey="facebook" fill="#10b981" barSize={22} />
            <Bar dataKey="instagram" fill="#f59e0b" barSize={22} />
            <Bar dataKey="linkedin" fill="#ef4444" barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default Dashboard;
