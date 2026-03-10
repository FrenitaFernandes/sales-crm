import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Activity, Bell, FileText, GaugeCircle, MessageSquare, Megaphone } from "lucide-react";

function Dashboard() {

  const [stats, setStats] = useState(null);

  const currency = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  useEffect(() => {

    const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";

    axios
      .get("http://localhost:5000/api/customer/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data || {}))
      .catch((err) => {
        console.error("Customer dashboard load error:", err);
        setStats({
          invoiceCount: 0,
          activeTickets: 0,
          unreadNotifications: 0,
          profileCompletion: 0,
          totalInvoiced: 0,
          totalPaid: 0,
          salesOverview: [],
          recentActivity: [],
          recommendedMessage: "Check back later for relevant offers.",
        });
      });

  }, []);

  const salesPoints = useMemo(() => {
    const rows = stats?.salesOverview || [];
    if (rows.length === 0) return { invoiced: "", paid: "", labels: [] };

    const maxValue = Math.max(
      1,
      ...rows.map((r) => Number(r.invoiced || 0)),
      ...rows.map((r) => Number(r.paid || 0))
    );

    const width = 640;
    const height = 220;
    const stepX = width / Math.max(1, rows.length - 1);

    const toY = (v) => height - (Number(v || 0) / maxValue) * (height - 20) - 10;

    const invoiced = rows
      .map((r, idx) => `${idx * stepX},${toY(r.invoiced)}`)
      .join(" ");

    const paid = rows
      .map((r, idx) => `${idx * stepX},${toY(r.paid)}`)
      .join(" ");

    return {
      invoiced,
      paid,
      labels: rows,
      width,
      height,
    };
  }, [stats]);

  const getActivityTone = (type) => {
    const t = String(type || "").toLowerCase();
    if (t === "advertisement") return { dot: "bg-fuchsia-500", chip: "bg-fuchsia-50 text-fuchsia-700" };
    if (t === "ticket") return { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" };
    if (t === "project") return { dot: "bg-blue-500", chip: "bg-blue-50 text-blue-700" };
    if (t === "order") return { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700" };
    return { dot: "bg-slate-400", chip: "bg-slate-100 text-slate-700" };
  };

  return (
    <div
      className="p-6 min-h-screen space-y-5"
      style={{ background: "radial-gradient(circle at 20% 0%, #e0f2fe 0%, #eef2ff 35%, #f8fafc 100%)" }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
          Customer Insights
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl shadow-lg p-5 flex items-start gap-4 border border-blue-100" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
          <div className="h-12 w-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Total Invoices</p>
            <p className="text-4xl font-bold text-slate-800 leading-tight">{stats?.invoiceCount || 0}</p>
            <p className="text-slate-500 text-sm">{currency(stats?.totalInvoiced || 0)} invoiced</p>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg p-5 flex items-start gap-4 border border-emerald-100" style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)" }}>
          <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow">
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Active Tickets</p>
            <p className="text-4xl font-bold text-slate-800 leading-tight">{stats?.activeTickets || 0}</p>
            <p className="text-slate-500 text-sm">Connected with support queue</p>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg p-5 flex items-start gap-4 border border-amber-100" style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)" }}>
          <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
            <Bell size={22} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Notifications</p>
            <p className="text-4xl font-bold text-slate-800 leading-tight">{stats?.notificationCount || 0}</p>
            <p className="text-slate-500 text-sm">{stats?.unreadNotifications || 0} unread alerts</p>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg p-5 flex items-start justify-between gap-4 border border-indigo-100" style={{ background: "linear-gradient(135deg, #eef2ff, #e0e7ff)" }}>
          <div>
            <p className="text-slate-500 text-sm">Profile Completion</p>
            <p className="text-4xl font-bold text-slate-800 leading-tight">{stats?.profileCompletion || 0}%</p>
            <div className="w-40 h-2 bg-slate-200 rounded-full mt-2">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(100, Number(stats?.profileCompletion || 0))}%` }}
              />
            </div>
          </div>
          <div
            className="h-24 w-24 rounded-full"
            style={{
              background: `conic-gradient(#6366f1 ${Math.min(100, Number(stats?.profileCompletion || 0))}%, #e2e8f0 0)`,
            }}
          >
            <div className="h-full w-full scale-75 rounded-full bg-white flex items-center justify-center text-indigo-600">
              <GaugeCircle size={26} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <div className="rounded-2xl shadow-lg p-5 border border-indigo-100" style={{ background: "linear-gradient(145deg, #ffffff, #f1f5ff)" }}>
            <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
              <Megaphone size={20} /> Recommended For You
            </h2>
            <p className="mt-3 text-slate-500">{stats?.recommendedMessage || "Check back later for relevant offers."}</p>
          </div>

          <div className="rounded-2xl shadow-lg p-5 border border-sky-100" style={{ background: "linear-gradient(145deg, #ffffff, #eefaff)" }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-3xl font-semibold text-slate-800">Sales Overview</h2>
              <div className="text-sm px-2 py-1 rounded bg-sky-100 text-sky-700">Connected invoice data</div>
            </div>

            {salesPoints.invoiced ? (
              <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${salesPoints.width} ${salesPoints.height}`} className="w-full min-w-[640px] h-64">
                  <rect x="0" y="0" width={salesPoints.width} height={salesPoints.height} fill="#f8fdff" rx="12" />
                  <polyline fill="none" stroke="#60a5fa" strokeWidth="4" points={salesPoints.invoiced} />
                  <polyline fill="none" stroke="#67e8f9" strokeWidth="4" points={salesPoints.paid} />
                </svg>
                <div className="grid grid-cols-7 gap-2 text-xs text-slate-500 mt-2">
                  {salesPoints.labels.map((row, idx) => (
                    <div key={`${row.month}-${idx}`} className="text-center">{row.month}</div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No invoice trend data available yet.</p>
            )}

            <div className="grid grid-cols-1 gap-4 mt-5">
              <div className="rounded-xl p-5 text-blue-900 border border-blue-100 shadow" style={{ background: "linear-gradient(120deg, #e0f2fe, #bfdbfe)" }}>
                <p className="text-sm opacity-80">Total Invoiced</p>
                <p className="text-4xl font-bold mt-1">{currency(stats?.totalInvoiced || 0)}</p>
                <p className="text-sm opacity-80 mt-1">Based on all your invoices</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg p-5 border border-slate-200" style={{ background: "linear-gradient(145deg, #ffffff, #f8fbff)" }}>
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Activity size={20} /> Recent Activity
          </h2>

          {Array.isArray(stats?.recentActivity) && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-700 text-sm">{item.title}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${getActivityTone(item.type).chip}`}>
                      {String(item.type || "activity")}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm">{item.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-2 w-2 rounded-full ${getActivityTone(item.type).dot}`} />
                    <p className="text-xs text-slate-400">{item.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No recent activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;