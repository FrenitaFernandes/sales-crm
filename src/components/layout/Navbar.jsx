// src/components/layout/Navbar.jsx
import { Navbar as BootstrapNavbar, Container, Dropdown } from "react-bootstrap";
import {
  MdNotifications,
  MdAccountCircle,
  MdLogout,
  MdSettings,
  MdMenu,
} from "react-icons/md";
import { useState } from "react";

const Navbar = ({ title, onLogout, onToggleSidebar, sidebarOpen }) => {
  const [notificationCount] = useState(3);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout - clear localStorage or redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
  };

  return (
    <BootstrapNavbar bg="white" expand="lg" className="navbar-wrapper shadow-sm">
      <Container fluid>
        <div className="navbar-left">
          {onToggleSidebar && (
            <button
              className="navbar-toggle-btn"
              onClick={onToggleSidebar}
              title="Toggle Sidebar"
            >
              <MdMenu size={24} />
            </button>
          )}
          <BootstrapNavbar.Brand as="h5" className="mb-0 fw-bold">
            {title}
          </BootstrapNavbar.Brand>
        </div>

        <div className="navbar-icons ms-auto">
          <button className="navbar-icon-btn" title="Notifications">
            <MdNotifications size={24} />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>

          <Dropdown align="end" className="navbar-dropdown">
            <Dropdown.Toggle
              as="button"
              className="navbar-icon-btn"
              id="profile-dropdown"
              title="Profile"
            >
              <MdAccountCircle size={24} />
            </Dropdown.Toggle>

            <Dropdown.Menu className="navbar-dropdown-menu">
              <Dropdown.Item href="#profile" className="navbar-dropdown-item">
                <MdAccountCircle size={18} /> My Profile
              </Dropdown.Item>
              <Dropdown.Item href="#settings" className="navbar-dropdown-item">
                <MdSettings size={18} /> Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={handleLogout}
                className="navbar-dropdown-item logout-item"
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
