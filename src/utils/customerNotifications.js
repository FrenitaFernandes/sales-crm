const NOTIFICATIONS_PREFIX = "customer_notifications_v1";
const SEEN_TICKETS_PREFIX = "customer_seen_tickets_v1";

function buildTicketId() {
  return `TKT-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
}

function normalizeTicketId(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length >= 5) return `TKT-${digits.slice(-5)}`;
  if (digits.length > 0) return `TKT-${digits.padStart(5, "0")}`;
  return buildTicketId();
}

function getCurrentCustomerKey() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const email = String(user?.email || "").trim().toLowerCase();
    if (email) return email;
  } catch {
    // Ignore parse errors and fallback to generic key.
  }

  return "guest";
}

function notificationsKey() {
  return `${NOTIFICATIONS_PREFIX}:${getCurrentCustomerKey()}`;
}

function seenTicketsKey() {
  return `${SEEN_TICKETS_PREFIX}:${getCurrentCustomerKey()}`;
}

export function getCustomerNotifications() {
  try {
    const raw = localStorage.getItem(notificationsKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomerNotifications(items) {
  localStorage.setItem(notificationsKey(), JSON.stringify(items));
}

export function getCustomerUnreadCount() {
  return getCustomerNotifications().filter((item) => item?.read !== true).length;
}

export function markAllCustomerNotificationsRead() {
  const notifications = getCustomerNotifications();
  const updated = notifications.map((item) => ({ ...item, read: true }));
  saveCustomerNotifications(updated);
  return updated;
}

export function removeCustomerNotification(notificationId) {
  const id = String(notificationId || "").trim();
  if (!id) return getCustomerNotifications();

  const notifications = getCustomerNotifications();
  const updated = notifications.filter((item) => String(item?._id || "") !== id);
  saveCustomerNotifications(updated);
  return updated;
}

export function syncCustomerTicketNotifications(ticketItems) {
  const tickets = Array.isArray(ticketItems) ? ticketItems : [];

  let seen = [];
  try {
    const rawSeen = localStorage.getItem(seenTicketsKey());
    const parsedSeen = rawSeen ? JSON.parse(rawSeen) : null;
    seen = Array.isArray(parsedSeen) ? parsedSeen : [];
  } catch {
    seen = [];
  }

  const currentIds = tickets
    .map((item) => String(item?._id || "").trim())
    .filter(Boolean);

  // First run: establish baseline so old tickets don't become new notifications.
  if (seen.length === 0 && currentIds.length > 0) {
    localStorage.setItem(seenTicketsKey(), JSON.stringify(currentIds));
    return { added: 0 };
  }

  const seenSet = new Set(seen);
  const notifications = getCustomerNotifications();
  const notificationEventIds = new Set(
    notifications.map((item) => String(item?.eventId || "")).filter(Boolean)
  );

  const newNotifications = [];

  tickets.forEach((ticket) => {
    const id = String(ticket?._id || "").trim();
    if (!id || seenSet.has(id)) return;

    seenSet.add(id);

    const eventId = `ticket-received:${id}`;
    if (notificationEventIds.has(eventId)) return;

    const ticketId = normalizeTicketId(ticket?.ticketId || id);
    const subject = String(ticket?.subject || ticket?.title || "Support Request").trim();

    newNotifications.push({
      _id: `${Date.now()}-${id}`,
      eventId,
      type: "ticket_received",
      title: "Ticket Received",
      message: `Your ticket ${ticketId} (${subject}) has been received.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
  });

  if (newNotifications.length > 0) {
    const updated = [...newNotifications, ...notifications];
    saveCustomerNotifications(updated);
  }

  localStorage.setItem(seenTicketsKey(), JSON.stringify(Array.from(seenSet)));

  return { added: newNotifications.length };
}
