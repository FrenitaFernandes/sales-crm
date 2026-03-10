import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const Reports = () => {
  const [activities, setActivities] = useState([]);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [counts, setCounts] = useState({
    leads: 0,
    ads: 0,
    stock: 0,
    projects: 0,
    invoices: 0,
  });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
        const headers = { Authorization: `Bearer ${token}` };

        const [leadRes, adRes, stockRes, projectRes, invoiceRes, activityRes] = await Promise.all([
          axios.get("http://localhost:5000/api/leads", { headers }),
          axios.get("http://localhost:5000/api/ads", { headers }),
          axios.get("http://localhost:5000/api/stock/entry", { headers }),
          axios.get("http://localhost:5000/api/projects", { headers }),
          axios.get("http://localhost:5000/api/invoices", { headers }),
          axios.get("http://localhost:5000/api/activity", { headers }),
        ]);

        setCounts({
          leads: (leadRes.data?.data || []).length,
          ads: (adRes.data?.data || []).length,
          stock: (stockRes.data?.data || []).length,
          projects: (projectRes.data?.data || []).length,
          invoices: (invoiceRes.data?.data || []).length,
        });

        const activityRows = (activityRes.data?.data || []).map((row, index) => ({
          id: row._id || String(index),
          dateTime: row.timestamp || row.createdAt,
          user: row.userName || row.userId?.email || row.userId?.name || "-",
          action: row.action || "-",
          details: [row.module, row.description].filter(Boolean).join(" - ") || "-",
        }));

        setActivities(activityRows);
      } catch (error) {
        console.error("Failed to load activity summary counts:", error);
      }
    };

    loadCounts();
  }, []);

  const summary = useMemo(
    () => [
      {
        label: "Leads Added",
        value: counts.leads,
        bg: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      },
      {
        label: "Advertisements",
        value: counts.ads,
        bg: "linear-gradient(135deg, #0f766e, #14b8a6)",
      },
      {
        label: "Stock",
        value: counts.stock,
        bg: "linear-gradient(135deg, #b45309, #f59e0b)",
      },
      {
        label: "Projects",
        value: counts.projects,
        bg: "linear-gradient(135deg, #be123c, #f43f5e)",
      },
      {
        label: "Invoice",
        value: counts.invoices,
        bg: "linear-gradient(135deg, #6d28d9, #9333ea)",
      },
    ],
    [counts]
  );

  const handleDeleteAllLogs = async () => {
    try {
      setIsDeletingAll(true);
      setActionMessage("");
      setActionError("");

      const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete("http://localhost:5000/api/activity", { headers });
      setActivities([]);
      setActionMessage("All activity logs deleted successfully.");
      setConfirmState(null);
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to delete all logs");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeleteSingleLog = async (logId) => {
    if (!logId) return;

    try {
      setDeletingLogId(logId);
      setActionMessage("");
      setActionError("");

      const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`http://localhost:5000/api/activity/${logId}`, { headers });
      setActivities((prev) => prev.filter((row) => row.id !== logId));
      setActionMessage("Activity log deleted successfully.");
      setConfirmState(null);
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to delete activity log");
    } finally {
      setDeletingLogId("");
    }
  };

  const toDisplayDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-CA");
  };

  const toDisplayTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const toDateKey = (value) => {
    if (!value) return "unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "unknown";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const groupedActivities = useMemo(() => {
    const bucket = activities.reduce((acc, item) => {
      const key = toDateKey(item.dateTime);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return Object.keys(bucket)
      .sort((a, b) => {
        if (a === "unknown") return 1;
        if (b === "unknown") return -1;
        return b.localeCompare(a);
      })
      .map((key) => ({ dateKey: key, rows: bucket[key] }));
  }, [activities]);

  return (
    <div className="container-fluid px-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 mb-3">
        <h2 className="mb-0">Activity Reports</h2>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() =>
            setConfirmState({
              type: "deleteAll",
              message: "Are you sure you want to delete all activity logs?",
            })
          }
          disabled={isDeletingAll}
        >
          {isDeletingAll ? "Deleting..." : "Delete All Logs"}
        </button>
      </div>

      {confirmState && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 1080 }}
        >
          <div className="bg-white rounded shadow p-3" style={{ width: "min(92vw, 420px)" }}>
            <h5 className="mb-2">Confirm Delete</h5>
            <p className="mb-3 text-muted">{confirmState.message}</p>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setConfirmState(null)}
                disabled={isDeletingAll || Boolean(deletingLogId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => {
                  if (confirmState.type === "deleteAll") {
                    handleDeleteAllLogs();
                  } else {
                    handleDeleteSingleLog(confirmState.logId);
                  }
                }}
                disabled={isDeletingAll || Boolean(deletingLogId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {actionMessage && <div className="alert alert-success py-2">{actionMessage}</div>}
      {actionError && <div className="alert alert-danger py-2">{actionError}</div>}

      <div className="row g-3 mb-4">
        {summary.map((item) => (
          <div className="col-12 col-sm-6 col-lg" key={item.label}>
            <div
              className="card border-0 shadow"
              style={{
                background: item.bg,
                minHeight: "120px",
              }}
            >
              <div className="card-body d-flex flex-column justify-content-center">
                <div className="small fw-semibold text-white text-uppercase" style={{ letterSpacing: "0.5px" }}>
                  {item.label}
                </div>
                <div className="display-5 fw-bold text-white lh-1 mt-1">{item.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex flex-column gap-3">
        {groupedActivities.length === 0 ? (
          <div className="shadow-sm bg-white p-3 rounded text-center text-muted">No activity found</div>
        ) : (
          groupedActivities.map((group) => (
            <div key={group.dateKey} className="shadow-sm bg-white rounded overflow-hidden">
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{ background: "#eaf3ff" }}>
                <strong>{group.dateKey === "unknown" ? "Unknown Date" : toDisplayDate(group.dateKey)}</strong>
                <span className="badge bg-primary">{group.rows.length} logs</span>
              </div>

              <div className="table-responsive p-2">
                <table className="table table-bordered table-striped mb-0">
                  <thead className="table-light text-center">
                    <tr>
                      <th>#</th>
                      <th>Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{toDisplayTime(row.dateTime)}</td>
                        <td>{row.user}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              setConfirmState({
                                type: "deleteOne",
                                logId: row.id,
                                message: "Are you sure you want to delete this activity log?",
                              })
                            }
                            disabled={deletingLogId === row.id || isDeletingAll}
                          >
                            {deletingLogId === row.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                        <td>{row.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reports;
