// src/components/layout/MainLayout.jsx
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Container } from "react-bootstrap";
import { useState, useEffect } from "react";

const MainLayout = ({
  children,
  title,
  role = "admin",
  onLogout,
  showBreadcrumb = false,
  breadcrumbs = [],
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, title]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className={`relative z-50 ${sidebarOpen ? "block" : "hidden"} md:block`}>
        <Sidebar role={role} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          title={title}
          onLogout={onLogout}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {showBreadcrumb && breadcrumbs.length > 0 && (
          <nav className="bg-white border-b border-gray-200 px-5 py-3 shadow-sm" aria-label="breadcrumb">
            <ol className="flex flex-wrap gap-0">
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center text-gray-500 text-sm">
                  {idx > 0 && <span className="mx-2 text-gray-300">/</span>}
                  {crumb.path ? (
                    <a href={crumb.path} className="text-blue-600 no-underline hover:text-blue-700 hover:underline transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Container fluid className="w-full max-w-full">
            {children}
          </Container>
        </main>
      </div>

      {/* Mobile overlay for sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
