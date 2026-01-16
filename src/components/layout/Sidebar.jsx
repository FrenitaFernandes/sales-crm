// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  MdDashboard,
  MdPeople,
  MdAssignment,
  MdShoppingCart,
  MdReport,
  MdNotifications,
  MdSettings,
  MdSupportAgent,
  MdInventory2,
  MdAdsClick,
  MdTask,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
} from "react-icons/md";

const iconMap = {
  dashboard: <MdDashboard className="icon" />,
  customers: <MdPeople className="icon" />,
  deals: <MdShoppingCart className="icon" />,
  leads: <MdPeople className="icon" />,
  stock: <MdInventory2 className="icon" />,
  reports: <MdReport className="icon" />,
  tasks: <MdTask className="icon" />,
  tickets: <MdAssignment className="icon" />,
  profile: <MdSettings className="icon" />,
  support: <MdSupportAgent className="icon" />,
  notifications: <MdNotifications className="icon" />,
  advertisement: <MdAdsClick className="icon" />,
};

const getIcon = (name) => iconMap[name] || null;

const Sidebar = ({ role = "admin" }) => {
  const [openSections, setOpenSections] = useState({
    "admin-sales": true,
    "admin-crm": true,
    "customer": true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menus = {
    "admin-crm": [
      { name: "Dashboard", path: "/admin/crm/dashboard", icon: "dashboard" },
      { name: "Customer Details", path: "/admin/crm/customer-details", icon: "customers" },
      { name: "Service Requests", path: "/admin/crm/service-requests", icon: "tickets" },
    ],
    "admin-sales": [
      { name: "Dashboard", path: "/admin/sales/dashboard", icon: "dashboard" },
      { name: "Deals", path: "/admin/sales/deals", icon: "deals" },
      { name: "Leads", path: "/admin/sales/leads", icon: "leads" },
      { name: "Stock", path: "/admin/sales/stock", icon: "stock" },
      { name: "Stock Report", path: "/admin/sales/stock-report", icon: "reports" },
      { name: "Follow Up Tasks", path: "/admin/sales/follow-up-tasks", icon: "tasks" },
      { name: "Reports", path: "/admin/sales/reports", icon: "reports" },
      { name: "Activity Report", path: "/admin/sales/activity-report", icon: "reports" },
      { name: "Advertisement", path: "/admin/sales/advertisement", icon: "advertisement" },
    ],
    customer: [
      { name: "Dashboard", path: "/customer/dashboard", icon: "dashboard" },
      { name: "Invoices", path: "/customer/invoices", icon: "reports" },
      { name: "Tickets", path: "/customer/tickets", icon: "tickets" },
      { name: "Profile", path: "/customer/profile", icon: "profile" },
      { name: "Support", path: "/customer/support", icon: "support" },
      { name: "Notifications", path: "/customer/notifications", icon: "notifications" },
    ],
  };

  // Define which sections to show based on role
  const allSections = [
    { key: "admin-sales", title: "Sales", roles: ["admin"] },
    { key: "admin-crm", title: "CRM", roles: ["admin"] },
    { key: "customer", title: "Customer", roles: ["customer"] },
  ];

  // Filter sections based on current role
  const sections = allSections.filter(section => section.roles.includes(role));

  // Determine sidebar logo based on role
  const logoText = role === "customer" ? "Customer" : "Admin";

  return (
    <aside className="sidebar-wrapper">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">{logoText}</h2>
        <p className="sidebar-subtitle" style={{ fontSize: "12px", color: "#cbd5e1", margin: 0 }}>
          {role === "customer" ? "Portal" : "Dashboard"}
        </p>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.key} className="sidebar-section">
            <button
              onClick={() => toggleSection(section.key)}
              className="sidebar-section-header"
            >
              <span>{section.title}</span>
              <span className="arrow-icon">
                {openSections[section.key] ? (
                  <MdKeyboardArrowUp size={18} />
                ) : (
                  <MdKeyboardArrowDown size={18} />
                )}
              </span>
            </button>

            {openSections[section.key] && (
              <div className="sidebar-submenu">
                {menus[section.key]?.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="sidebar-link-icon">{getIcon(item.icon)}</span>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
