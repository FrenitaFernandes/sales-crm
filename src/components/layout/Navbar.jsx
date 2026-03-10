// src/components/layout/Navbar.jsx

import { Navbar as BootstrapNavbar, Container, Dropdown, Modal, Button } from "react-bootstrap";
import {
  MdNotifications,
  MdAccountCircle,
  MdLogout,
  MdSettings,
  MdMenu,
  MdDelete,
  MdHelp,
  MdChevronRight,
} from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCustomerUnreadCount } from "../../utils/customerNotifications";

const Navbar = ({ title, onLogout, onToggleSidebar }) => {

  const [notificationCount, setNotificationCount] = useState(0);
  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });
  const [confirmInfo, setConfirmInfo] = useState({ show: false, message: '', onConfirm: null });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole"); // admin or customer

  const loadNotificationCount = async () => {
    try {
      if (role === "customer") {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";

        if (!token) {
          setNotificationCount(getCustomerUnreadCount());
          return;
        }

        const [localUnread, backendRes] = await Promise.all([
          Promise.resolve(getCustomerUnreadCount()),
          axios.get("http://localhost:5000/api/customer/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const backendUnread = (backendRes.data?.data || []).filter((item) => item?.read !== true).length;
        setNotificationCount(localUnread + backendUnread);
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

  const handleDeleteAccount = () => {
    setShowSettingsMenu(false);
    setConfirmInfo({
      show: true,
      message: "Are you sure you want to delete your account? This action cannot be undone. Your data will be kept for admin records.",
      onConfirm: async () => {
        setConfirmInfo({ show: false, message: '', onConfirm: null });
        try {
          const token = localStorage.getItem("authToken") || localStorage.getItem("token");
          if (!token) {
            setModalInfo({ show: true, title: 'Error', message: 'You are not logged in.' });
            return;
          }

          const response = await axios.delete(
            "http://localhost:5000/api/customers/delete-account",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data.success) {
            // Clear local storage
            localStorage.removeItem("authToken");
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            localStorage.removeItem("user");

            // show success modal then redirect
            setModalInfo({ show: true, title: 'Success', message: 'Account deleted successfully.' });
          } else {
            setModalInfo({ show: true, title: 'Error', message: response.data.message || 'Failed to delete account.' });
          }
        } catch (err) {
          console.error("Delete Account Error:", err);
          setModalInfo({ show: true, title: 'Error', message: err.response?.data?.message || 'Failed to delete account. Please try again.' });
        }
      }
    });
  };

  return (
    <BootstrapNavbar
      bg="white"
      expand="lg"
      className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center"
    >
      <Container fluid>

        {/* modal for alerts */}
        <Modal
          show={modalInfo.show}
          onHide={() => setModalInfo({ ...modalInfo, show: false })}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{modalInfo.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{modalInfo.message}</Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                setModalInfo({ ...modalInfo, show: false });
                if (modalInfo.title === 'Success') {
                  navigate('/login');
                }
              }}
            >
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {/* confirmation modal */}
        <Modal
          show={confirmInfo.show}
          onHide={() => setConfirmInfo({ show: false, message: '', onConfirm: null })}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm</Modal.Title>
          </Modal.Header>
          <Modal.Body>{confirmInfo.message}</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setConfirmInfo({ show: false, message: '', onConfirm: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={() => confirmInfo.onConfirm && confirmInfo.onConfirm()}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Help Modal */}
        <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Help & Support</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <h6 className="font-semibold text-slate-800 mb-2">📧 Email Support</h6>
                <p className="text-slate-600 text-sm">
                  <a href="mailto:support@salescrm.com" className="text-blue-600 hover:underline">
                    support@salescrm.com
                  </a>
                </p>
              </div>
              <div>
                <h6 className="font-semibold text-slate-800 mb-2">📞 Phone Support</h6>
                <p className="text-slate-600 text-sm">
                  <a href="tel:+91-1234-567890" className="text-blue-600 hover:underline">
                    +91-1234-567890
                  </a>
                </p>
              </div>
              <div>
                <h6 className="font-semibold text-slate-800 mb-2">💬 Live Chat</h6>
                <p className="text-slate-600 text-sm">
                  Available Monday-Friday, 9AM-6PM IST
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                <p className="text-slate-600 text-sm">
                  For urgent issues, please contact support via email or phone.
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowHelpModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

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

          {/* CUSTOMER MENU - HAMBURGER ICON */}
          {role === "customer" && (
            <Dropdown align="end" autoClose={false}>
              <Dropdown.Toggle
                as="button"
                className="border-0 cursor-pointer text-gray-500 flex items-center justify-center p-2 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-all"
                id="settings-dropdown"
                title="Menu"
              >
                <MdMenu size={24} />
              </Dropdown.Toggle>

              <Dropdown.Menu className="rounded-lg border border-gray-200 shadow-lg p-2 min-w-56">

                {/* Settings Header - Toggle submenu */}
                <div
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-all cursor-pointer rounded-md"
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                >
                  <MdSettings size={18} /> Settings
                  <MdChevronRight
                    size={18}
                    className="ml-auto"
                    style={{
                      transform: showSettingsMenu ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>

                {/* Settings Submenu */}
                {showSettingsMenu && (
                  <>
                    {/* My Profile */}
                    <Dropdown.Item
                      onClick={() => navigate("/customer/profile")}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all ml-4 border-l-2 border-slate-300"
                    >
                      <MdAccountCircle size={16} /> My Profile
                    </Dropdown.Item>

                    {/* Help */}
                    <Dropdown.Item
                      onClick={() => setShowHelpModal(true)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-all ml-4 border-l-2 border-slate-300"
                    >
                      <MdHelp size={16} /> Help
                    </Dropdown.Item>

                    {/* Delete Account */}
                    <Dropdown.Item
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all ml-4 border-l-2 border-red-300"
                    >
                      <MdDelete size={16} /> Delete Account
                    </Dropdown.Item>
                  </>
                )}

                <Dropdown.Divider className="my-1" />

                {/* Logout */}
                <Dropdown.Item
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-red-100 hover:text-red-600 transition-all"
                >
                  <MdLogout size={18} /> Logout
                </Dropdown.Item>

              </Dropdown.Menu>
            </Dropdown>
          )}

          {/* ADMIN SETTINGS - SIMPLE DROPDOWN */}
          {role === "admin" && (
            <Dropdown align="end">
              <Dropdown.Toggle
                as="button"
                className="border-0 cursor-pointer text-gray-500 flex items-center justify-center p-2 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-all"
                id="admin-menu"
                title="Menu"
              >
                <MdMenu size={24} />
              </Dropdown.Toggle>

              <Dropdown.Menu className="rounded-lg border border-gray-200 shadow-lg p-2">
                <Dropdown.Item
                  onClick={() => navigate("/admin/settings")}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-all"
                >
                  <MdSettings size={18} /> Settings
                </Dropdown.Item>

                <Dropdown.Divider className="my-1" />

                <Dropdown.Item
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-red-100 hover:text-red-600 transition-all"
                >
                  <MdLogout size={18} /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}

        </div>

      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;