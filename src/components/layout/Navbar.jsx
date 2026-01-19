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
    <BootstrapNavbar bg="white" expand="lg" className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center min-h-60px">
      <Container fluid>
        <div className="flex items-center gap-3 flex-1">
          {onToggleSidebar && (
            <button
              className="bg-none border-0 cursor-pointer text-gray-500 p-2 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-all"
              onClick={onToggleSidebar}
              title="Toggle Sidebar"
            >
              <MdMenu size={24} />
            </button>
          )}
          <BootstrapNavbar.Brand as="h5" className="mb-0 font-bold text-slate-800 text-lg">
            {title}
          </BootstrapNavbar.Brand>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="bg-none border-0 cursor-pointer text-gray-500 flex items-center justify-center p-2 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-all relative" title="Notifications">
            <MdNotifications size={24} />
            {notificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-max text-center animate-pulse">{notificationCount}</span>
            )}
          </button>

          <Dropdown align="end" className="navbar-dropdown">
            <Dropdown.Toggle
              as="button"
              className="bg-none border-0 cursor-pointer text-gray-500 flex items-center justify-center p-2 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-all"
              id="profile-dropdown"
              title="Profile"
            >
              <MdAccountCircle size={24} />
            </Dropdown.Toggle>

            <Dropdown.Menu className="rounded-lg border border-gray-200 shadow-lg p-2">
              <Dropdown.Item href="#profile" className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-all">
                <MdAccountCircle size={18} /> My Profile
              </Dropdown.Item>
              <Dropdown.Item href="#settings" className="flex items-center gap-3 px-4 py-2.5 text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-all">
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
        </div>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
