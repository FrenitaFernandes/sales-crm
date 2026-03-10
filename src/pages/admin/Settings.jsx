import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdVisibility,
  MdVisibilityOff,
  MdPeople,
  MdWork,
  MdReceiptLong,
  MdDownload,
  MdInfoOutline,
} from "react-icons/md";

const API_BASE = "http://localhost:5000/api/settings/admin";

const tabs = [
  { id: "profile", label: "Profile & Security" },
  { id: "company", label: "Company Details" },
  { id: "data", label: "Data Export" },
];

const readJsonSafe = async (res) => {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Settings API returned HTML instead of JSON. Please ensure backend is running and /api/settings route is available."
    );
  }
};

const EXPORT_HISTORY_KEY = "admin_export_history_v1";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [exportHistory, setExportHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(EXPORT_HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        customers: parsed.customers || null,
        projects: parsed.projects || null,
        invoices: parsed.invoices || null,
      };
    } catch {
      return { customers: null, projects: null, invoices: null };
    }
  });

  const [company, setCompany] = useState({
    companyName: "",
    logo: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    gstNumber: "",
    taxLabel: "GST",
    taxPercent: 0,
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
  });

  const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
  const role = localStorage.getItem("userRole");

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const rememberExport = (type, fileName) => {
    const next = {
      ...exportHistory,
      [type]: {
        at: new Date().toISOString(),
        fileName: fileName || `${type}.csv`,
      },
    };
    setExportHistory(next);
    localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(next));
  };

  const handleLogoUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file for logo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCompany((prev) => ({ ...prev, logo: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const loadSettings = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        throw new Error(data.message || "Failed to load settings");
      }

      const payload = data.data || {};
      setProfile({
        name: payload.profile?.name || "",
        email: payload.profile?.email || "",
        phone: payload.profile?.phone || "",
      });
      setCompany((prev) => ({ ...prev, ...(payload.company || {}) }));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please login to access settings.");
      return;
    }

    if (role && role !== "admin") {
      navigate("/login");
      return;
    }

    clearAlerts();
    loadSettings().catch((err) => {
      setError(err.message || "Failed to load settings");
    });
  }, [navigate, role, token]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const saveProfile = async () => {
    clearAlerts();
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      await loadSettings({ silent: true });
      setMessage(data.message || "Data saved successfully");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...(JSON.parse(localStorage.getItem("user") || "{}")),
          ...data.data,
        })
      );
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
  };

  const savePassword = async () => {
    clearAlerts();
    try {
      const res = await fetch(`${API_BASE}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setMessage(data.message || "Password changed successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || "Failed to change password");
    }
  };

  const saveCompany = async () => {
    clearAlerts();
    try {
      const res = await fetch(`${API_BASE}/company`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(company),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(data.message || "Failed to save company details");
      await loadSettings({ silent: true });
      setMessage(data.message || "Data saved successfully");
    } catch (err) {
      setError(err.message || "Failed to save company details");
    }
  };

  const downloadExport = async (type) => {
    clearAlerts();
    try {
      const res = await fetch(`${API_BASE}/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to export ${type}`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || `${type}.csv`;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      rememberExport(type, fileName);
      setMessage(`${type} export downloaded.`);
    } catch (err) {
      setError(err.message || `Failed to export ${type}`);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading settings...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Settings</h2>

      {message && <div className="mb-3 rounded bg-green-100 px-4 py-2 text-green-800">{message}</div>}
      {error && <div className="mb-3 rounded bg-red-100 px-4 py-2 text-red-800">{error}</div>}

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              clearAlerts();
              setActiveTab(tab.id);
            }}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                <input className="border rounded px-3 py-2" placeholder="Email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                <input className="border rounded px-3 py-2" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded" onClick={saveProfile}>Save Profile</button>
            </div>

            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold mb-3">Password</h3>
              {!showPasswordForm ? (
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => { clearAlerts(); setShowPasswordForm(true); }}>
                  Change Password
                </button>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      ["currentPassword", "Current Password"],
                      ["newPassword", "New Password"],
                      ["confirmPassword", "Confirm Password"],
                    ].map(([key, label]) => (
                      <div key={key} className="relative">
                        <input
                          className="border rounded px-3 py-2 w-full pr-10"
                          placeholder={label}
                          type={showPasswords[key] ? "text" : "password"}
                          value={passwords[key]}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))}
                        >
                          {showPasswords[key] ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={savePassword}>Save Password</button>
                    <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded" onClick={() => {
                      setShowPasswordForm(false);
                      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
                    }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "company" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Company Name</label>
                <input className="border rounded px-3 py-2 w-full" value={company.companyName} onChange={(e) => setCompany((p) => ({ ...p, companyName: e.target.value }))} />
              </div>
              <div className="border rounded px-3 py-2">
                <label className="block text-sm text-gray-600 mb-2">Company Logo</label>
                {company.logo ? (
                  <div className="mt-3">
                    <img src={company.logo} alt="Company logo preview" className="h-16 w-16 object-contain border rounded bg-white" />
                    <button type="button" className="mt-2 text-sm text-red-600" onClick={() => setCompany((p) => ({ ...p, logo: "" }))}>Remove Logo</button>
                  </div>
                ) : (
                  <input type="file" accept="image/*" onChange={(e) => { clearAlerts(); handleLogoUpload(e.target.files?.[0]); }} className="w-full text-sm" />
                )}
              </div>

              {[
                ["addressLine1", "Address Line 1"],
                ["addressLine2", "Address Line 2"],
                ["city", "City"],
                ["state", "State"],
                ["country", "Country"],
                ["pincode", "Pincode"],
                ["gstNumber", "GST / Tax Number"],
                ["taxLabel", "Tax Label"],
                ["taxPercent", "Tax Percent"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{label}</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    type={key === "taxPercent" ? "number" : "text"}
                    value={company[key]}
                    onChange={(e) => setCompany((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-600 mb-1">Currency</label>
                <select className="border rounded px-3 py-2 w-full" value={company.currency} onChange={(e) => setCompany((p) => ({ ...p, currency: e.target.value }))}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Timezone</label>
                <select className="border rounded px-3 py-2 w-full" value={company.timezone} onChange={(e) => setCompany((p) => ({ ...p, timezone: e.target.value }))}>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date Format</label>
                <select className="border rounded px-3 py-2 w-full" value={company.dateFormat} onChange={(e) => setCompany((p) => ({ ...p, dateFormat: e.target.value }))}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={saveCompany}>Save Company Details</button>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-4">
              <h3 className="text-lg font-semibold text-slate-800">Export Center</h3>
              <p className="text-sm text-slate-600 mt-1">
                Download CRM data as CSV files for reporting, analysis, or offline backups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: "customers",
                  title: "Customers",
                  desc: "Names, contacts, status and company details.",
                  icon: <MdPeople size={20} />,
                },
                {
                  key: "projects",
                  title: "Projects",
                  desc: "Project status, owners, dates and delivery details.",
                  icon: <MdWork size={20} />,
                },
                {
                  key: "invoices",
                  title: "Invoices",
                  desc: "Invoice numbers, totals, due dates and status.",
                  icon: <MdReceiptLong size={20} />,
                },
              ].map((item) => (
                <div key={item.key} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <span className="text-blue-600">{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      CSV
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{item.desc}</p>
                  <button
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-2"
                    onClick={() => downloadExport(item.key)}
                  >
                    <MdDownload size={16} />
                    Export {item.title}
                  </button>
                  <div className="mt-3 text-[11px] text-slate-500">
                    Last export:{" "}
                    {exportHistory[item.key]?.at
                      ? new Date(exportHistory[item.key].at).toLocaleString()
                      : "Never"}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
              <MdInfoOutline size={16} className="mt-0.5" />
              <div>
                Exported files are downloaded to your browser download folder. Keep sensitive CSV files secure.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
