import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { MessageCircle, Paperclip, Trash2, X } from "lucide-react";

const API_BASE = "http://localhost:5000/api/admin";

const sortChatMessagesChronologically = (messages = []) =>
  [...messages].sort((a, b) => {
    const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;

    if (timeA !== timeB) return timeA - timeB;

    const idA = String(a?._id || "");
    const idB = String(b?._id || "");
    return idA.localeCompare(idB);
  });

const statuses = ["All", "Pending", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];

function buildTicketId() {
  return `TKT-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
}

function normalizeTicketId(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length >= 5) return `TKT-${digits.slice(-5)}`;
  if (digits.length > 0) return `TKT-${digits.padStart(5, "0")}`;
  return buildTicketId();
}

function fallbackTicketIdFromRequestId(rawId) {
  const id = String(rawId || "").trim();
  if (!id || id.startsWith("local-")) return "-";

  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  }

  return `TKT-${String(hash).padStart(5, "0")}`;
}

function resolveTicketId(request) {
  const existing = String(request?.ticketId || "").trim();
  if (existing) return normalizeTicketId(existing);

  // Fallback for older records that were created without ticketId.
  return fallbackTicketIdFromRequestId(request?._id);
}

function resolveAttachmentSrc(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) return "";

  // Accept base64 data URIs saved by customer support form.
  if (/^data:/i.test(raw)) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads/")) {
    return `${API_BASE.replace("/api/admin", "")}${raw}`;
  }

  return "";
}

function resolveRequestAttachment(request) {
  if (!request || typeof request !== "object") return "";

  return (
    request.uploadedImage ||
    request.uploadedPreview ||
    request.attachment ||
    request.file ||
    ""
  );
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString();
}

function resolveChatAttachmentSrc(attachment) {
  const raw =
    typeof attachment === "string"
      ? attachment
      : String(attachment?.dataUrl || "").trim();
  if (!raw) return "";

  if (/^data:/i.test(raw)) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads/")) return `${API_BASE.replace("/api/admin", "")}${raw}`;

  return "";
}

function isImageAttachment(src, mimeType) {
  if (/^data:image\//i.test(src)) return true;
  if (String(mimeType || "").toLowerCase().startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(src);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);

  // UI state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("new"); // new / old

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // modals
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachment, setChatAttachment] = useState(null);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [allowingChatId, setAllowingChatId] = useState("");
  const chatFileInputRef = useRef(null);

  // toast
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  // create form
  const [customerId, setCustomerId] = useState("");
  const [ticketId, setTicketId] = useState(() => buildTicketId());
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Open");
  const [enableChat, setEnableChat] = useState(false);
  const [createdDate, setCreatedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3500);
  };

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  // ✅ fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers?registeredOnly=true`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.log("Fetch customers error:", err);
    }
  };

  // ✅ fetch requests
  const fetchRequests = async () => {
    try {
      const q = new URLSearchParams();
      if (statusFilter && statusFilter !== "All") q.append("status", statusFilter);
      if (search.trim()) q.append("search", search.trim());

      const res = await fetch(`${API_BASE}/service-requests?${q.toString()}`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.log("Fetch requests error:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchRequests();
    // eslint-disable-next-line
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchRequests();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search]);

  // sort
  const sortedRequests = useMemo(() => {
    const copy = [...requests];
    copy.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === "new" ? db - da : da - db;
    });
    return copy;
  }, [requests, sortOrder]);

  // pagination
  const totalPages = Math.ceil(sortedRequests.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRequests.slice(start, start + pageSize);
  }, [sortedRequests, page]);

  const resetForm = () => {
    setCustomerId("");
    setTicketId(buildTicketId());
    setSubject("");
    setCategory("");
    setDescription("");
    setPriority("Medium");
    setStatus("Open");
    setEnableChat(false);
    const now = new Date();
    setCreatedDate(now.toISOString().slice(0, 16));
    setUploadedFile(null);
    setUploadedPreview(null);
  };

  // ✅ create request
  const handleCreate = async (e) => {
    e.preventDefault();

    const resolvedSubject = subject.trim();
    const resolvedTitle = resolvedSubject;
    const resolvedTicketId = normalizeTicketId(ticketId);

    if (!customerId || !resolvedSubject) {
      showToast("Please select customer and enter subject.", "error");
      return;
    }

    // optimistic UI update: add to local list immediately
    const optimisticId = `local-${Date.now()}`;
    const optimistic = {
      _id: optimisticId,
      ticketId: resolvedTicketId,
      subject: resolvedSubject,
      category,
      title: resolvedTitle,
      description: description.trim(),
      priority,
      status,
      enableChat,
      uploadedImage: uploadedPreview || null,
      customerId: customers.find((c) => c._id === customerId) || { _id: customerId, name: 'Unknown' },
      createdAt: createdDate ? new Date(createdDate).toISOString() : new Date().toISOString(),
    };

    setRequests((prev) => [optimistic, ...prev]);
    try {
      // Send JSON to simple backend endpoint (includes base64 preview if available)
      const payload = {
        customerId,
        ticketId: resolvedTicketId,
        subject: resolvedSubject,
        category,
        title: resolvedTitle,
        description: description.trim(),
        priority,
        status,
        enableChat,
        createdDate: createdDate || new Date().toISOString(),
        uploadedPreview: uploadedPreview || null,
      };

      const res = await fetch(`${API_BASE}/service-requests-simple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== optimisticId));
        showToast(data.message || "Failed to create request", "error");
        return;
      }

      const created = data?.request || data?.data || null;
      setRequests((prev) =>
        prev.map((row) => {
          if (row._id !== optimisticId) return row;

          if (!created || typeof created !== "object") {
            return { ...row, ticketId: resolvedTicketId };
          }

          return {
            ...created,
            ticketId: normalizeTicketId(created.ticketId || resolvedTicketId),
          };
        })
      );

      showToast("Request sent successfully.");
      setShowCreate(false);
      resetForm();
    } catch (err) {
      setRequests((prev) => prev.filter((r) => r._id !== optimisticId));
      showToast("Server error while creating request", "error");
    }
  };

  // ✅ update status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/service-requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update status", "error");
        return;
      }

      showToast("✅ Status updated");
      fetchRequests();
    } catch (err) {
      showToast("Server error while updating status", "error");
    }
  };

  // ✅ delete request
  const handleDelete = async (id) => {
    if (!id) return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`${API_BASE}/service-requests/${deleteTarget}`, {
        method: "DELETE",
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw || "Failed to delete request" };
      }

      if (!res.ok) {
        showToast(data.message || "Failed to delete request", "error");
        return;
      }

      showToast("✅ Service request deleted");
      setDeleteTarget(null);
      fetchRequests();
    } catch (err) {
      showToast("Server error while deleting request", "error");
    }
  };

  const toggleChat = async (id, nextEnabled) => {
    if (!id) return;

    try {
      setAllowingChatId(id);
      const token = getToken();

      try {
        await axios.put(
          `http://localhost:5000/api/services/${id}/allow-chat`,
          { enableChat: !!nextEnabled },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch {
        await axios.put(
          `http://localhost:5000/api/services/${id}`,
          { enableChat: !!nextEnabled },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setRequests((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, enableChat: !!nextEnabled } : item
        )
      );
      showToast(nextEnabled ? "Chat enabled for this request." : "Chat disabled for this request.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Unable to update chat status", "error");
    } finally {
      setAllowingChatId("");
    }
  };

  const fetchChatMessages = async (requestId, options = {}) => {
    if (!requestId) return;
    const { silent = false } = options;

    try {
      if (!silent) setChatLoading(true);
      setChatError("");
      const token = getToken();

      const res = await axios.get(`http://localhost:5000/api/services/${requestId}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChatMessages(sortChatMessagesChronologically(res.data?.data || []));
    } catch (err) {
      if (!silent) {
        setChatMessages([]);
      }
      setChatError(err?.response?.data?.message || "Failed to load chat");
    } finally {
      if (!silent) setChatLoading(false);
    }
  };

  const openChat = async (item) => {
    if (!item?._id || !item?.enableChat) return;

    setActiveChat(item);
    await fetchChatMessages(item._id);
  };

  const sendChatMessage = async () => {
    if (!activeChat?._id) return;

    const message = chatInput.trim();
    if (!message && !chatAttachment) return;

    try {
      setChatSending(true);
      setChatError("");
      const token = getToken();
      const payload = { message };
      payload.senderContext = "admin";
      if (chatAttachment) {
        payload.attachment = chatAttachment;
      }

      await axios.post(
        `http://localhost:5000/api/services/${activeChat._id}/chat`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatInput("");
      setChatAttachment(null);
      await fetchChatMessages(activeChat._id, { silent: true });
    } catch (err) {
      setChatError(err?.response?.data?.message || "Failed to send message");
    } finally {
      setChatSending(false);
    }
  };

  const handleChatAttachmentSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;

    try {
      if (file.size > 6 * 1024 * 1024) {
        setChatError("Attachment must be smaller than 6MB");
        return;
      }

      setChatError("");
      const dataUrl = await readFileAsDataUrl(file);
      setChatAttachment({
        name: file.name,
        mimeType: file.type || "",
        dataUrl,
      });
    } catch {
      setChatError("Failed to read selected file");
    }
  };

  useEffect(() => {
    if (!activeChat?._id) return undefined;

    const intervalId = setInterval(() => {
      fetchChatMessages(activeChat._id, { silent: true });
    }, 3000);

    const onFocus = () => fetchChatMessages(activeChat._id, { silent: true });
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [activeChat?._id]);

  // KPI cards
  const kpis = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "Pending").length;
    const inProg = requests.filter((r) => r.status === "In Progress").length;
    const completed = requests.filter((r) => r.status === "Completed").length;
    return { total, pending, inProg, completed };
  }, [requests]);

  return (
    <div className="p-6">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 px-4 py-3 rounded shadow-lg text-white z-[10050] transition-opacity ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-bold">Service Requests</h2>
          <p className="text-gray-500 text-sm">
            Track customer issues, update statuses and monitor progress.
          </p>
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          onClick={() => setShowCreate(true)}
        >
          + Create Request
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">Total</p>
          <h3 className="text-2xl font-bold">{kpis.total}</h3>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">Pending</p>
          <h3 className="text-2xl font-bold">{kpis.pending}</h3>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">In Progress</p>
          <h3 className="text-2xl font-bold">{kpis.inProg}</h3>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500">Completed</p>
          <h3 className="text-2xl font-bold">{kpis.completed}</h3>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-5 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <input
          className="border p-2 rounded w-full lg:w-[40%]"
          placeholder="Search customer / email / subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="border p-2 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="new">Sort: Newest</option>
            <option value="old">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Ticket ID</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border w-44">Description</th>
              <th className="p-3 border">Priority</th>
              <th className="p-3 border">Attachment</th>
              <th className="p-3 border">Created</th>
              <th className="p-3 border min-w-[130px]">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length > 0 ? (
              paginated.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="p-3 border">
                    <div className="font-semibold">{r.customerId?.name || "N/A"}</div>
                    <div className="text-xs text-gray-500">{r.customerId?.email}</div>
                  </td>

                  <td className="p-3 border">
                    <div className="font-medium">{resolveTicketId(r)}</div>
                  </td>

                  <td className="p-3 border">
                    <div className="font-medium">{r.subject || r.title || "-"}</div>
                  </td>

                  <td className="p-3 border">
                    <div className="text-sm">{r.category || "-"}</div>
                  </td>

                  <td className="p-3 border w-44">
                    <div className="max-w-[170px] text-xs text-gray-500 line-clamp-2">
                      {r.description || "-"}
                    </div>
                  </td>

                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        r.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : r.priority === "Low"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.priority || "Medium"}
                    </span>
                  </td>

                  <td className="p-3 border">
                    {resolveAttachmentSrc(resolveRequestAttachment(r)) ? (
                      <button
                        type="button"
                        className="h-14 w-14 rounded border overflow-hidden bg-gray-50"
                        onClick={() =>
                          setPreviewImage(resolveAttachmentSrc(resolveRequestAttachment(r)))
                        }
                        title="Click to view image"
                      >
                        <img
                          src={resolveAttachmentSrc(resolveRequestAttachment(r))}
                          alt="attachment thumbnail"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="p-3 border text-sm">{formatDate(r.createdAt)}</td>

                  <td className="p-3 border min-w-[130px]">
                    <select
                      className="border p-2 rounded w-full min-w-[120px]"
                      value={r.status}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  <td className="p-3 border">
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        className={`relative h-5 w-10 overflow-hidden rounded-full transition ${
                          r.enableChat ? "bg-blue-600" : "bg-gray-300"
                        } ${allowingChatId === r._id ? "opacity-60 cursor-not-allowed" : ""}`}
                        onClick={() => toggleChat(r._id, !r.enableChat)}
                        disabled={allowingChatId === r._id}
                        aria-label={r.enableChat ? "Disable chat" : "Enable chat"}
                        title={r.enableChat ? "Disable chat" : "Enable chat"}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                            r.enableChat ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      {r.enableChat && (
                        <button
                          type="button"
                          className="h-8 w-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white inline-flex items-center justify-center"
                          onClick={() => openChat(r)}
                          title="Open chat"
                        >
                          <MessageCircle size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center"
                        onClick={() => handleDelete(r._id)}
                        title="Delete request"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-6 text-center text-gray-500">
                  No service requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            className="border px-3 py-1 rounded"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="border px-3 py-1 rounded"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-lg w-[95%] max-w-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Create Service Request</h3>
              <button
                className="text-gray-600 hover:text-black"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Customer */}
              <div>
                <label className="text-sm text-gray-600">Customer *</label>
                <select
                  className="border p-2 rounded w-full"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer ID Display */}
              {customerId && (
                <div>
                  <label className="text-sm text-gray-600">Customer ID</label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full bg-gray-50"
                    value={customerId}
                    readOnly
                  />
                </div>
              )}

              {/* Ticket ID and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Ticket ID</label>
                  <input
                    className="border p-2 rounded w-full bg-gray-50"
                    placeholder="Auto-generated"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Subject *</label>
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Enter subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Eg: Technical, Billing, Support"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Priority</label>
                  <select
                    className="border p-2 rounded w-full"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Status and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <select
                    className="border p-2 rounded w-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Date</label>
                  <input
                    type="datetime-local"
                    className="border p-2 rounded w-full bg-gray-50"
                    value={createdDate}
                    readOnly
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-600">Description</label>
                <textarea
                  className="border p-2 rounded w-full"
                  rows={3}
                  placeholder="Enter request description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Image upload / attachment */}
              <div>
                <label className="text-sm text-gray-600">Attachment (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    setUploadedFile(file);
                    const reader = new FileReader();
                    reader.onload = () => setUploadedPreview(reader.result);
                    reader.readAsDataURL(file);
                  }}
                />

                {uploadedPreview && (
                  <div className="mt-2">
                    <img src={uploadedPreview} alt="attachment" className="max-h-48 rounded border" />
                  </div>
                )}
              </div>

              {/* Enable Chat Toggle */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                <label className="text-sm text-gray-600">Enable Chat</label>
                <button
                  type="button"
                  onClick={() => setEnableChat(!enableChat)}
                  className={`w-12 h-6 rounded-full transition ${
                    enableChat ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition transform ${
                      enableChat ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium">
                  {enableChat ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  className="border px-4 py-2 rounded hover:bg-gray-100"
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-lg w-[95%] max-w-md p-5">
            <h3 className="text-lg font-bold mb-2">Delete Service Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this request?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="border px-4 py-2 rounded hover:bg-gray-100"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10010] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl p-3 max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-2 right-2 bg-white border rounded px-2 py-1 text-sm"
              onClick={() => setPreviewImage(null)}
            >
              Close
            </button>
            <img
              src={previewImage}
              alt="attachment preview"
              className="max-w-[80vw] max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[10001] p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold text-sm">
                Chat - {activeChat.subject || activeChat.title || "Support Request"}
              </h3>
              <button
                type="button"
                className="border px-3 py-1 rounded"
                onClick={() => {
                  setActiveChat(null);
                  setChatInput("");
                  setChatAttachment(null);
                  setChatError("");
                }}
              >
                Close
              </button>
            </div>

            <div className="p-3" style={{ maxHeight: "340px", overflowY: "auto" }}>
              {chatLoading ? (
                <p className="text-sm text-gray-500">Loading chat...</p>
              ) : chatMessages.length === 0 ? (
                <p className="text-sm text-gray-500">No messages yet.</p>
              ) : (
                <div className="space-y-2">
                  {chatMessages.map((msg) => {
                    const senderRole = String(msg?.senderRole || "").trim().toLowerCase();
                    const isAdminMessage =
                      senderRole === "admin" ||
                      String(msg?.senderName || "").trim().toLowerCase() === "admin";
                    return (
                      <div
                        key={msg._id}
                        className={`p-2 rounded text-sm ${
                          isAdminMessage ? "bg-gray-100 ml-0 mr-10" : "bg-blue-100 ml-8 mr-0"
                        }`}
                      >
                        {msg.message ? <div>{msg.message}</div> : null}
                        {resolveChatAttachmentSrc(msg.attachment) ? (
                          <div className="mt-2">
                            {isImageAttachment(
                              resolveChatAttachmentSrc(msg.attachment),
                              msg.attachment?.mimeType
                            ) ? (
                              <button
                                type="button"
                                className="h-16 w-16 rounded border overflow-hidden bg-white"
                                title={msg.attachment?.name || "Attachment"}
                                onClick={() =>
                                  setPreviewImage(resolveChatAttachmentSrc(msg.attachment))
                                }
                              >
                                <img
                                  src={resolveChatAttachmentSrc(msg.attachment)}
                                  alt={msg.attachment?.name || "chat attachment"}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ) : (
                              <a
                                className="text-blue-700 underline text-xs"
                                href={resolveChatAttachmentSrc(msg.attachment)}
                                download={msg.attachment?.name || "attachment"}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {msg.attachment?.name || "View attachment"}
                              </a>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {chatError && <p className="text-red-600 text-sm mt-2">{chatError}</p>}
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                ref={chatFileInputRef}
                type="file"
                className="hidden"
                onChange={handleChatAttachmentSelect}
              />
              <button
                type="button"
                className="border rounded px-2 py-2"
                title="Attach file"
                onClick={() => chatFileInputRef.current?.click()}
                disabled={chatSending}
              >
                <Paperclip size={16} />
              </button>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                placeholder="Type message"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                disabled={chatSending}
              />
              {chatAttachment ? (
                <div className="flex items-center gap-1 text-xs bg-gray-100 border rounded px-2">
                  <span className="max-w-28 truncate">{chatAttachment.name}</span>
                  <button
                    type="button"
                    className="text-gray-600"
                    onClick={() => setChatAttachment(null)}
                    title="Remove attachment"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={sendChatMessage}
                disabled={chatSending}
              >
                {chatSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
