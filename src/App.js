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

// ✅ BASIC PAGES (YOUR AUTH + HOME)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// ✅ LAYOUT
import MainLayout from "./components/layout/MainLayout";

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
import LeadDetails from "./pages/admin/sales/LeadDetails";
import GetEmail from "./pages/admin/sales/GetEmail";
import GetPhone from "./pages/admin/sales/GetPhone";
import DownloadLead from "./pages/admin/sales/DownloadLead";
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

        {/* ======================== */}
        {/*  BASIC PUBLIC ROUTES     */}
        {/* ======================== */}

        {/* Default route → Home */}
        <Route path="/" element={<Home />} />

        {/* Login / Register / Forgot */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />


        {/* ======================== */}
        {/*  ADMIN CRM ROUTES        */}
        {/* ======================== */}
        <Route
          path="/admin/crm/dashboard"
          element={
            <MainLayout>
              <AdminCRMDashboard />
            </MainLayout>
          }
        />
        <Route
          path="/admin/crm/customer-details"
          element={
            <MainLayout>
              <CustomerDetails />
            </MainLayout>
          }
        />
        <Route
          path="/admin/crm/service-requests"
          element={
            <MainLayout>
              <ServiceRequests />
            </MainLayout>
          }
        />


        {/* ======================== */}
        {/*  ADMIN SALES ROUTES      */}
        {/* ======================== */}

        <Route
          path="/admin/sales/dashboard"
          element={
            <MainLayout>
              <AdminSalesDashboard />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/deals"
          element={
            <MainLayout>
              <Deals />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/stock"
          element={
            <MainLayout>
              <Stock />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/stock-report"
          element={
            <MainLayout>
              <StockReport />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/leads"
          element={
            <MainLayout>
              <Leads />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/leads/:id"
          element={
            <MainLayout>
              <LeadDetails />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/leads/get-email"
          element={
            <MainLayout>
              <GetEmail />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/leads/get-phone"
          element={
            <MainLayout>
              <GetPhone />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/leads/download-lead"
          element={
            <MainLayout>
              <DownloadLead />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/follow-up-tasks"
          element={
            <MainLayout>
              <FollowUpTasks />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/reports"
          element={
            <MainLayout>
              <Reports />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/advertisement"
          element={
            <MainLayout>
              <Advertisement />
            </MainLayout>
          }
        />

        <Route
          path="/admin/sales/activity-report"
          element={
            <MainLayout>
              <ActivityReport />
            </MainLayout>
          }
        />


        {/* ======================== */}
        {/*  CUSTOMER ROUTES         */}
        {/* ======================== */}
        <Route
          path="/customer/dashboard"
          element={
            <MainLayout>
              <CustomerDashboard />
            </MainLayout>
          }
        />

        <Route
          path="/customer/invoices"
          element={
            <MainLayout>
              <Invoices />
            </MainLayout>
          }
        />

        <Route
          path="/customer/tickets"
          element={
            <MainLayout>
              <Tickets />
            </MainLayout>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />

        <Route
          path="/customer/support"
          element={
            <MainLayout>
              <Support />
            </MainLayout>
          }
        />

        <Route
          path="/customer/notifications"
          element={
            <MainLayout>
              <Notifications />
            </MainLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
