import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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

const MODULE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const KPI_CARD_STYLES = {
  "Total Leads": {
    background: "#dbeafe",
    border: "#93c5fd",
    label: "#1e40af",
    value: "#1d4ed8",
  },
  "Follow-ups Today": {
    background: "#dcfce7",
    border: "#86efac",
    label: "#166534",
    value: "#16a34a",
  },
  "Converted Leads": {
    background: "#ffedd5",
    border: "#fdba74",
    label: "#9a3412",
    value: "#ea580c",
  },
  "Stock Remaining": {
    background: "#ede9fe",
    border: "#c4b5fd",
    label: "#6d28d9",
    value: "#7c3aed",
  },
  "Pending Tasks": {
    background: "#ffe4e6",
    border: "#fda4af",
    label: "#9f1239",
    value: "#e11d48",
  },
};

/* ---------- COMPONENT ---------- */

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);
  const [stockSummary, setStockSummary] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [ads, setAds] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
        const headers = { Authorization: `Bearer ${token}` };

        const [leadRes, stockRes, invoiceRes, projectRes, adRes, activityRes, stockEntryRes] = await Promise.all([
          axios.get("http://localhost:5000/api/leads", { headers }),
          axios.get("http://localhost:5000/api/stock/summary", { headers }),
          axios.get("http://localhost:5000/api/invoices", { headers }),
          axios.get("http://localhost:5000/api/projects", { headers }),
          axios.get("http://localhost:5000/api/ads", { headers }),
          axios.get("http://localhost:5000/api/activity", { headers }),
          axios.get("http://localhost:5000/api/stock/entry", { headers }),
        ]);

        setLeads(leadRes.data?.data || []);
        setStockSummary(stockRes.data?.data || []);
        setInvoices(invoiceRes.data?.data || []);
        setProjects(projectRes.data?.data || []);
        setAds(adRes.data?.data || []);
        setActivityLogs(activityRes.data?.data || []);
        setStockEntries(stockEntryRes.data?.data || []);
      } catch (loadError) {
        console.error("Sales dashboard load error:", loadError);
        setError(loadError.response?.data?.message || "Failed to load sales dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const metrics = useMemo(() => {
    const normalizeStatus = (status) => String(status || "").trim().toLowerCase();
    const totalLeads = leads.length;
    const convertedLeads = leads.filter((l) => normalizeStatus(l.status) === "converted").length;

    const today = new Date();
    const sameDay = (dateValue) => {
      const d = new Date(dateValue);
      return !Number.isNaN(d.getTime()) &&
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
    };

    const followUpsToday = leads.reduce((count, lead) => {
      const followUps = Array.isArray(lead.followUps) ? lead.followUps : [];
      return count + (followUps.some((f) => sameDay(f?.date)) ? 1 : 0);
    }, 0);

    const pendingTasks = leads.filter((l) => {
      const s = normalizeStatus(l.status);
      return ["new", "contacted", "interested", "in progress", "follow-up"].includes(s);
    }).length;

    const stockRemaining = stockSummary.reduce(
      (sum, item) => sum + Number(item.remaining ?? item.availableQty ?? 0),
      0
    );

    return { totalLeads, convertedLeads, followUpsToday, pendingTasks, stockRemaining };
  }, [leads, stockSummary]);

  const trendData = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
    const now = new Date();
    const monthRows = [];

    for (let i = 4; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthRows.push({ key, month: monthFormatter.format(d), leads: 0, converted: 0 });
    }

    const rowMap = new Map(monthRows.map((r) => [r.key, r]));

    leads.forEach((lead) => {
      const created = new Date(lead.createdAt || lead.date);
      if (Number.isNaN(created.getTime())) return;

      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
      const row = rowMap.get(key);
      if (!row) return;

      row.leads += 1;
      if (String(lead.status || "").trim().toLowerCase() === "converted") {
        row.converted += 1;
      }
    });

    return monthRows;
  }, [leads]);

  const moduleCountData = useMemo(() => {
    return [
      { module: "Leads", count: leads.length },
      { module: "Invoices", count: invoices.length },
      { module: "Projects", count: projects.length },
      { module: "Ads", count: ads.length },
      { module: "Stock", count: stockEntries.length },
      { module: "Activity", count: activityLogs.length },
    ];
  }, [leads, invoices, projects, ads, stockEntries, activityLogs]);

  return (
    <>
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold mb-5">Sales Dashboard</h1>

      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          ["Total Leads", metrics.totalLeads],
          ["Follow-ups Today", metrics.followUpsToday],
          ["Converted Leads", metrics.convertedLeads],
          ["Stock Remaining", metrics.stockRemaining],
          ["Pending Tasks", metrics.pendingTasks],
        ].map(([label, value]) => (
          <div
            key={label}
            className="p-3 rounded shadow-sm border"
            style={{
              backgroundColor: KPI_CARD_STYLES[label]?.background,
              borderColor: KPI_CARD_STYLES[label]?.border,
            }}
          >
            <p className="text-sm" style={{ color: KPI_CARD_STYLES[label]?.label }}>{label}</p>
            <h2 className="text-lg font-bold" style={{ color: KPI_CARD_STYLES[label]?.value }}>
              {loading ? "..." : value}
            </h2>
          </div>
        ))}
      </div>

      {/* LINE CHART */}
      <div className="bg-white p-3 rounded shadow-sm mb-6">
        <h2 className="text-base font-semibold mb-2">Monthly Lead Trend</h2>

        <ResponsiveContainer width="100%" height={220}>
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

      {/* MODULE COUNTS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded shadow-sm border border-blue-100">
          <h2 className="text-base font-semibold mb-2">Sales Page Counts</h2>
          <p className="text-xs text-gray-500 mb-2">Live count of existing Sales pages data</p>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={moduleCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="module" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {moduleCountData.map((_, idx) => (
                  <Cell key={`bar-${idx}`} fill={MODULE_COLORS[idx % MODULE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            {moduleCountData.map((item, idx) => (
              <div key={item.module} className="rounded border p-2" style={{ borderColor: `${MODULE_COLORS[idx % MODULE_COLORS.length]}55` }}>
                <p className="text-xs text-gray-500">{item.module}</p>
                <p className="text-lg font-bold" style={{ color: MODULE_COLORS[idx % MODULE_COLORS.length] }}>{loading ? "..." : item.count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm border border-purple-100">
          <h2 className="text-base font-semibold mb-2">Module Distribution</h2>
          <p className="text-xs text-gray-500 mb-2">Share by module records</p>

          <div className="flex justify-center">
            <PieChart width={280} height={260}>
              <Pie
                data={moduleCountData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={48}
                paddingAngle={2}
                dataKey="count"
                nameKey="module"
              >
                {moduleCountData.map((_, idx) => (
                  <Cell key={`pie-${idx}`} fill={MODULE_COLORS[idx % MODULE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
