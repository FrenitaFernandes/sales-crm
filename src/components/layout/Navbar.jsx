// src/components/layout/Navbar.jsx

import { Navbar as BootstrapNavbar, Container, Dropdown } from "react-bootstrap";
import {
  MdNotifications,
  MdAccountCircle,
  MdLogout,
  MdSettings,
  MdMenu,
} from "react-icons/md";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCustomerUnreadCount } from "../../utils/customerNotifications";

const ADMIN_CHAT_LAST_SEEN_KEY = "admin_chat_last_seen_v1";
const CUSTOMER_CHAT_LAST_SEEN_KEY = "customer_chat_last_seen_v1";

const Navbar = ({ title, onLogout, onToggleSidebar }) => {

  const [notificationCount, setNotificationCount] = useState(0);
  const [chatPopup, setChatPopup] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("userRole"); // admin or customer

  const loadNotificationCount = async () => {
    try {
      if (role === "customer") {
        setNotificationCount(getCustomerUnreadCount());
        return;
      }

      if (role !== "admin") {
        setNotificationCount(0);
        return;
      }

      const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
      if (!token) {
        setNotificationCount(0);
        return;
      }

      const res = await axios.get("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const unread = (res.data?.data || []).filter((item) => item?.isRead !== true);
      setNotificationCount(unread.length);
    } catch (error) {
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    loadNotificationCount();

    const handleNotificationsUpdated = () => {
      loadNotificationCount();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, [role]);

  useEffect(() => {
    if (role !== "admin" && role !== "customer") return undefined;

    const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
    if (!token) return undefined;

    const lastSeenKey = role === "admin" ? ADMIN_CHAT_LAST_SEEN_KEY : CUSTOMER_CHAT_LAST_SEEN_KEY;
    if (!localStorage.getItem(lastSeenKey)) {
      localStorage.setItem(lastSeenKey, new Date().toISOString());
    }

    let popupTimer = null;

    const checkNewChatMessages = async () => {
      try {
        const since = localStorage.getItem(lastSeenKey) || new Date(0).toISOString();
        const endpoint =
          role === "admin"
            ? "http://localhost:5000/api/services/admin/chat-notifications"
            : "http://localhost:5000/api/services/customer/chat-notifications";

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          params: { since },
        });

        const rows = res.data?.data || [];
        if (!rows.length) return;

        const latest = rows[rows.length - 1];
        localStorage.setItem(
          lastSeenKey,
          String(latest?.createdAt || new Date().toISOString())
        );

        const onAdminChatPage = location.pathname === "/admin/crm/service-requests";
        const onCustomerChatPage = location.pathname === "/customer/tickets";
        if ((role === "admin" && onAdminChatPage) || (role === "customer" && onCustomerChatPage)) {
          return;
        }

        const popupText =
          role === "admin"
            ? `Received a message from ${String(latest?.customerName || "Customer").trim() || "Customer"}`
            : "New message from Admin";
        setChatPopup(popupText);
        if (popupTimer) clearTimeout(popupTimer);
        popupTimer = setTimeout(() => setChatPopup(""), 3500);
      } catch {
        // Ignore polling errors to avoid noisy UI.
      }
    };

    checkNewChatMessages();
    const intervalId = setInterval(checkNewChatMessages, 10000);
    const onFocus = () => checkNewChatMessages();
    window.addEventListener("focus", onFocus);

    return () => {
      if (popupTimer) clearTimeout(popupTimer);
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [role, location.pathname]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");

      navigate("/login");
    }
  };

  return (
    <BootstrapNavbar
      bg="white"
      expand="lg"
      className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center"
    >
      {chatPopup && (
        <div className="fixed top-5 right-5 z-[11000] rounded bg-blue-600 px-4 py-3 text-sm text-white shadow-lg">
          {chatPopup}
        </div>
      )}
      <Container fluid>

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3 flex-1">

          {onToggleSidebar && (
            <button
              className="border-0 cursor-pointer text-gray-500 p-2 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-all"
              onClick={onToggleSidebar}
              title="Toggle Sidebar"
            >
              <MdMenu size={24} />
            </button>
          )}

          <BootstrapNavbar.Brand
            as="h5"
            className="mb-0 font-bold text-slate-800 text-lg"
          >
            {title}
          </BootstrapNavbar.Brand>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 ml-auto">

          {/* NOTIFICATIONS */}
          <button
            className="border-0 cursor-pointer text-gray-500 flex items-center justify-center p-2 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-all relative"
            title="Notifications"
            onClick={() =>
              role === "admin"
                ? navigate("/admin/crm/notifications")
                : navigate("/customer/notifications")
            }
          >
            <MdNotifications size={24} />

            {notificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>

          {/* PROFILE DROPDOWN */}
          <Dropdown align="end">

            <Dropdown.Toggle
              as="button"
              className="border-0 cursor-pointer text-gray-500 flex items-center justify-center p-2 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-all"
              id="profile-dropdown"
              title="Account"
            >
              <MdAccountCircle size={24} />
            </Dropdown.Toggle>

            <Dropdown.Menu className="rounded-lg border border-gray-200 shadow-lg p-2">

              {/* SHOW ONLY FOR CUSTOMER */}
              {role === "customer" && (
                <Dropdown.Item
                  onClick={() => navigate("/customer/profile")}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-all"
                >
                  <MdAccountCircle size={18} /> My Profile
                </Dropdown.Item>
              )}

              {/* SETTINGS */}
              <Dropdown.Item
                onClick={() =>
                  role === "admin"
                    ? navigate("/admin/settings")
                    : navigate("/customer/settings")
                }
                className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-all"
              >
                <MdSettings size={18} /> Settings
              </Dropdown.Item>

              <Dropdown.Divider className="my-1" />

              {/* LOGOUT */}
              <Dropdown.Item
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-red-100 hover:text-red-600 transition-all"
              >
                <MdLogout size={18} /> Logout
              </Dropdown.Item>

            </Dropdown.Menu>

          </Dropdown>

        </div>

      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
