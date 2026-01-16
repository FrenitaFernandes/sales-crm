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
    <div className="main-layout-wrapper">
      <div className={`sidebar-column ${sidebarOpen ? "open" : "closed"}`}>
        <Sidebar role={role} />
      </div>

      <div className="content-column">
        <Navbar
          title={title}
          onLogout={onLogout}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {showBreadcrumb && breadcrumbs.length > 0 && (
          <nav className="breadcrumb-nav" aria-label="breadcrumb">
            <ol className="breadcrumb">
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="breadcrumb-item">
                  {crumb.path ? (
                    <a href={crumb.path}>{crumb.label}</a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <main className="main-content">
          <Container fluid className="content-container">
            {children}
          </Container>
        </main>
      </div>

      {/* Mobile overlay for sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
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
