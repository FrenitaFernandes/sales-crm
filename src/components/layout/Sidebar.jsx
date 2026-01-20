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
  MdEmail,
  MdPhone,
  MdDownload,
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
  email: <MdEmail className="icon" />,
  phone: <MdPhone className="icon" />,
  download: <MdDownload className="icon" />,
};

const getIcon = (name) => iconMap[name] || null;

const Sidebar = ({ role = "admin" }) => {
  const [openSections, setOpenSections] = useState({
    "admin-sales": true,
    "admin-crm": true,
    "customer": true,
  });
  
  const [openSubMenus, setOpenSubMenus] = useState({
    leads: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSubMenu = (menuKey) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
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
      { 
        name: "Leads", 
        path: "/admin/sales/leads", 
        icon: "leads",
        subMenu: [
          { name: "Leads", path: "/admin/sales/leads", icon: "leads" },
          { name: "Get Email", path: "/admin/sales/leads/get-email", icon: "email" },
          { name: "Get Phone", path: "/admin/sales/leads/get-phone", icon: "phone" },
          { name: "Download Lead", path: "/admin/sales/leads/download-lead", icon: "download" },
        ]
      },
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
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white p-5 overflow-y-auto shadow-2xl">
      <div className="mb-6 pb-4 border-b border-white border-opacity-10">
        <h2 className="text-2xl font-bold text-center m-0 text-white tracking-widest">{logoText}</h2>
        <p className="text-xs text-slate-400 m-0 text-center">
          {role === "customer" ? "Portal" : "Dashboard"}
        </p>
      </div>

      <nav className="flex flex-col gap-2.5">
        {sections.map((section) => (
          <div key={section.key} className="mb-2.5">
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex justify-between items-center p-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white border-0 rounded-md cursor-pointer text-sm font-semibold mb-1 hover:from-slate-600 hover:to-slate-500 hover:translate-x-0.5 transition-all text-left"
            >
              <span>{section.title}</span>
              <span className="text-xs transition-transform">
                {openSections[section.key] ? (
                  <MdKeyboardArrowUp size={18} />
                ) : (
                  <MdKeyboardArrowDown size={18} />
                )}
              </span>
            </button>

            {openSections[section.key] && (
              <div className="pl-2.5 flex flex-col gap-1.25">
                {menus[section.key]?.map((item) => (
                  <div key={item.path}>
                    {item.subMenu ? (
                      <>
                        <button
                          onClick={() => toggleSubMenu(item.name.toLowerCase())}
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-slate-300 no-underline rounded-md text-sm transition-all border-l-4 border-transparent hover:bg-white hover:bg-opacity-10 hover:text-white bg-transparent cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center text-lg min-w-max">{getIcon(item.icon)}</span>
                            <span>{item.name}</span>
                          </div>
                          <span className="text-xs">
                            {openSubMenus[item.name.toLowerCase()] ? (
                              <MdKeyboardArrowUp size={16} />
                            ) : (
                              <MdKeyboardArrowDown size={16} />
                            )}
                          </span>
                        </button>
                        {openSubMenus[item.name.toLowerCase()] && (
                          <div className="pl-6 flex flex-col gap-1">
                            {item.subMenu.map((subItem) => (
                              <NavLink
                                key={subItem.path}
                                to={subItem.path}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-4 py-2 text-slate-300 no-underline rounded-md text-sm transition-all border-l-4 border-transparent hover:bg-white hover:bg-opacity-10 hover:text-white hover:border-l-blue-600 hover:pl-4.5 ${
                                    isActive
                                      ? "bg-blue-600 text-white border-l-blue-700 font-semibold"
                                      : ""
                                  }`
                                }
                              >
                                <span className="flex items-center justify-center text-base min-w-max">{getIcon(subItem.icon)}</span>
                                <span>{subItem.name}</span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-slate-300 no-underline rounded-md text-sm transition-all border-l-4 border-transparent hover:bg-white hover:bg-opacity-10 hover:text-white hover:border-l-blue-600 hover:pl-4.5 ${
                            isActive
                              ? "bg-blue-600 text-white border-l-blue-700 font-semibold"
                              : ""
                          }`
                        }
                      >
                        <span className="flex items-center justify-center text-lg min-w-max">{getIcon(item.icon)}</span>
                        <span>{item.name}</span>
                      </NavLink>
                    )}
                  </div>
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
