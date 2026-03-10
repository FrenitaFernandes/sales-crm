import { MessageCircle, Paperclip, Ticket, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { syncCustomerTicketNotifications } from "../../utils/customerNotifications";

const BACKEND_BASE = "http://localhost:5000";

function resolveAttachmentSrc(uploadedImage) {
  const raw = String(uploadedImage || "").trim();
  if (!raw) return "";

  if (raw.startsWith("data:image/")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads/")) return `${BACKEND_BASE}${raw}`;

  return "";
}

function resolveChatAttachmentSrc(attachment) {
  const raw =
    typeof attachment === "string"
      ? attachment
      : String(attachment?.dataUrl || "").trim();
  if (!raw) return "";

  if (/^data:/i.test(raw)) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads/")) return `${BACKEND_BASE}${raw}`;

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

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachment, setChatAttachment] = useState(null);
  const [chatSending, setChatSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatFileInputRef = useRef(null);

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  const fetchTickets = async (options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) setLoading(true);
      const token = getToken();
      if (!token) {
        setTickets([]);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const myEmail = String(user?.email || "").toLowerCase();

      const res = await axios.get("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows = (res.data?.data || [])
        .filter((item) => {
          const email = String(item?.customerId?.email || "").toLowerCase();
          return myEmail ? email === myEmail : true;
        })
        .map((item) => ({
          _id: item._id,
          id: item.ticketId || `TCK-${String(item._id).slice(-4).toUpperCase()}`,
          subject: item.subject || item.title || "Support Request",
          category: item.category || "General",
          description: item.description || "-",
          priority: item.priority || "Medium",
          status: item.status || "Pending",
          uploadedImage: item.uploadedImage || "",
          created: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
          enableChat: !!item.enableChat,
        }));

      const syncResult = syncCustomerTicketNotifications(
        (res.data?.data || []).filter((item) => {
          const email = String(item?.customerId?.email || "").toLowerCase();
          return myEmail ? email === myEmail : true;
        })
      );
      if (syncResult.added > 0) {
        window.dispatchEvent(new Event("notifications-updated"));
      }

      setTickets(rows);
    } catch (error) {
      console.error("Fetch tickets error:", error);
      setTickets([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openChat = async (ticket) => {
    if (!ticket?.enableChat) return;

    setActiveChat(ticket);
    await fetchChatMessages(ticket._id);
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

      setChatMessages(res.data?.data || []);
    } catch (error) {
      if (!silent) {
        setChatMessages([]);
      }
      setChatError(error?.response?.data?.message || "Failed to load chat");
    } finally {
      if (!silent) setChatLoading(false);
    }
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
    } catch (error) {
      setChatError(error?.response?.data?.message || "Failed to send message");
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
    const intervalId = setInterval(() => fetchTickets({ silent: true }), 10000);
    const onFocus = () => fetchTickets({ silent: true });

    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Ticket /> Tickets
      </h1>

      <div className="bg-white p-6 shadow rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3 text-left">Ticket ID</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Attachment</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Chat</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-3 text-center text-gray-500">Loading tickets...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-3 text-center text-gray-500">No tickets found.</td>
              </tr>
            ) : tickets.map((t, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{t.id}</td>
                <td className="p-3 max-w-sm truncate">{t.subject}</td>
                <td className="p-3">{t.category}</td>
                <td className="p-3 max-w-md truncate">{t.description}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm rounded-full
                      ${
                        t.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : t.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    `}
                  >
                    {t.priority}
                  </span>
                </td>

                <td className="p-3">
                  {resolveAttachmentSrc(t.uploadedImage) ? (
                    <button
                      type="button"
                      className="h-12 w-12 rounded border overflow-hidden bg-gray-50"
                      onClick={() => setPreviewImage(resolveAttachmentSrc(t.uploadedImage))}
                      title="Click to view image"
                    >
                      <img
                        src={resolveAttachmentSrc(t.uploadedImage)}
                        alt="attachment thumbnail"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

                <td className="p-3">{t.created}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm rounded-full
                      ${
                        t.status === "Open"
                          ? "bg-green-100 text-green-700"
                          : t.status === "In Progress" || t.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-300 text-gray-700"
                      }
                    `}
                  >
                    {t.status}
                  </span>
                </td>

                <td className="p-3">
                  {t.enableChat ? (
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 inline-flex items-center justify-center"
                      title="Open chat"
                      onClick={() => openChat(t)}
                    >
                      <MessageCircle size={16} />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {activeChat && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[10001] p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="font-semibold text-sm">Chat - {activeChat.subject}</h3>
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
}

export default Tickets;
