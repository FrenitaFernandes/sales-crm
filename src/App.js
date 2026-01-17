import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/layout.css";
import "./styles/navbar.css";
import "./styles/sidebar.css";
import "./styles/table.css";
import "./styles/chart.css";
import "./styles/dashboard.css";
import "./styles/responsive.css";
import "./App.css";

// ADMIN CRM PAGES
import AdminCRMDashboard from "./pages/admin/crm/Dashboard";
import CustomerDetails from "./pages/admin/crm/CustomerDetails";
import ServiceRequests from "./pages/admin/crm/ServiceRequests";

// ADMIN SALES PAGES
import AdminSalesDashboard from "./pages/admin/sales/Dashboard";
import Deals from "./pages/admin/sales/Deals";
import Stock from "./pages/admin/sales/Stock";
import StockReport from "./pages/admin/sales/StockReport";
import Leads from "./pages/admin/sales/Leads";
import FollowUpTasks from "./pages/admin/sales/FollowUpTasks";
import Reports from "./pages/admin/sales/Reports";
import Advertisement from "./pages/admin/sales/Advertisement";
import ActivityReport from "./pages/admin/sales/ActivityReport";

// CUSTOMER PAGES
import CustomerDashboard from "./pages/customer/Dashboard";
import Invoices from "./pages/customer/Invoices";
import Tickets from "./pages/customer/Tickets";
import Profile from "./pages/customer/Profile";
import Support from "./pages/customer/Support";
import Notifications from "./pages/customer/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/admin/crm/dashboard" />} />

        {/* ✅ ADMIN CRM ROUTES */}
        <Route path="/admin/crm/dashboard" element={<AdminCRMDashboard />} />
        <Route path="/admin/crm/customer-details" element={<CustomerDetails />} />
        <Route path="/admin/crm/service-requests" element={<ServiceRequests />} />

        {/* ✅ ADMIN SALES ROUTES */}
        <Route path="/admin/sales/dashboard" element={<AdminSalesDashboard />} />
        <Route path="/admin/sales/deals" element={<Deals />} />
        <Route path="/admin/sales/stock" element={<Stock />} />
        <Route path="/admin/sales/stock-report" element={<StockReport />} />
        <Route path="/admin/sales/leads" element={<Leads />} />
        <Route path="/admin/sales/follow-up-tasks" element={<FollowUpTasks />} />
        <Route path="/admin/sales/reports" element={<Reports />} />
        <Route path="/admin/sales/advertisement" element={<Advertisement />} />
        <Route path="/admin/sales/activity-report" element={<ActivityReport />} />

        {/* ✅ CUSTOMER ROUTES */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/invoices" element={<Invoices />} />
        <Route path="/customer/tickets" element={<Tickets />} />
        <Route path="/customer/profile" element={<Profile />} />
        <Route path="/customer/support" element={<Support />} />
        <Route path="/customer/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
