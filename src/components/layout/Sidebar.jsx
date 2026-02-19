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
  MdBuild,
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
  build: <MdBuild className="icon" />,
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
    stock: false,
    "stock report": false,
    invoice: false,
    project: false,
    advertisement: false,
    "activity report": false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSubMenu = (menuKey) => {
    setOpenSubMenus((prev) => {
      const isOpen = prev[menuKey];
      const nextState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});

      nextState[menuKey] = !isOpen;

      return nextState;
    });
  };

  const menus = {
    "admin-crm": [
      { name: "Dashboard", path: "/admin/crm/dashboard", icon: "dashboard" },
      { name: "Customer Details", path: "/admin/crm/customer-details", icon: "customers" },
      { name: "Service Requests", path: "/admin/crm/service-requests", icon: "tickets" },
      { name: "Notifications", path: "/admin/crm/notifications", icon: "notifications" },
    ],
    "admin-sales": [
      { name: "Dashboard", path: "/admin/sales/dashboard", icon: "dashboard" },
      { 
        name: "Leads", 
        path: "/admin/sales/leads", 
        icon: "leads",
        subMenu: [
          { name: "Leads", path: "/admin/sales/leads", icon: "leads" },
          { name: "Download Lead", path: "/admin/sales/leads/download-lead", icon: "download" },
        ]
      },
      { 
        name: "Stock", 
        path: "/admin/sales/stock/entry", 
        icon: "stock",
        subMenu: [
          { name: "Stock Entry", path: "/admin/sales/stock/entry", icon: "stock" },
          { name: "Stock Summary", path: "/admin/sales/stock/summary", icon: "stock" },
          { name: "Stock Usage", path: "/admin/sales/stock/usage", icon: "stock" },
        ]
      },
      { 
        name: "Stock Report", 
        path: "/admin/sales/stock/report", 
        icon: "reports",
        subMenu: [
          { name: "Stock Report", path: "/admin/sales/stock/report", icon: "reports" },
        ]
      },
      { 
        name: "Invoice", 
        path: "/admin/sales/invoice/new", 
        icon: "reports",
        subMenu: [
          { name: "New Invoice", path: "/admin/sales/invoice/new", icon: "reports" },
          { name: "Invoice History", path: "/admin/sales/invoice/history", icon: "reports" },
        ]
      },
      { 
        name: "Project", 
        path: "/admin/sales/project", 
        icon: "tasks"
      },
      { 
        name: "Advertisement", 
        path: "/admin/sales/advertisement/add", 
        icon: "advertisement",
        subMenu: [
          { name: "Add Advertisement", path: "/admin/sales/advertisement/add", icon: "advertisement" },
          { name: "Advertisement List", path: "/admin/sales/advertisement/list", icon: "advertisement" },
        ]
      },
      { 
        name: "Activity Report", 
        path: "/admin/sales/activity-report", 
        icon: "reports",
        subMenu: [
          { name: "Reports", path: "/admin/sales/activity-report", icon: "reports" },
        ]
      },
    ],
    customer: [
      { name: "Dashboard", path: "/customer/dashboard", icon: "dashboard" },
      { name: "Invoices", path: "/customer/invoices", icon: "reports" },
      { name: "Tickets", path: "/customer/tickets", icon: "tickets" },
      { name: "Profile", path: "/customer/profile", icon: "profile" },
      { name: "Support", path: "/customer/support", icon: "support" },
      { name: "Notifications", path: "/customer/notifications", icon: "notifications" },
      { name: "Customize Project", path: "/customer/customize-project", icon: "build" },

    ],
  };

  // Define which sections to show based on role
  const allSections = [
    { key: "admin-sales", title: "Sales", roles: ["admin"] },
    { key: "admin-crm", title: "CRM", roles: ["admin"] },
    { key: "customer", title: "Customer Portal", roles: ["customer"] },
  ];

  // Filter sections based on current role
  const sections = allSections.filter(section => section.roles.includes(role));

  // Determine sidebar logo based on role
  const logoText = role === "customer" ? "Customer" : "Admin";

  return (
    <aside className="sidebar-wrapper w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-5 overflow-y-auto shadow-2xl">
      <div className="mb-6 pb-4 border-b border-white border-opacity-10">
        <h2 className="text-2xl font-bold text-center m-0 text-white tracking-widest">{logoText}</h2>
        <p className="text-xs text-slate-400 m-0 text-center">
          {role === "customer" ? "Portal" : "Dashboard"}
        </p>
      </div>

      <nav className="flex flex-col gap-2.5">
        {/* Customer role: show direct menu without sections */}
        {role === "customer" ? (
          <div className="flex flex-col gap-1.25">
            {menus.customer?.map((item) => (
              <NavLink
                key={item.path}
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
            ))}
          </div>
        ) : (
          /* Admin role: show sections with dropdown */
          sections.map((section) => (
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
          ))
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
