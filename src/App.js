import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/layout.css";
import "./styles/navbar.css";
import "./styles/sidebar.css";
import "./styles/table.css";
import "./styles/chart.css";
import "./styles/dashboard.css";
import "./styles/responsive.css";
import "./App.css";

// LAYOUT
import MainLayout from "./components/layout/MainLayout";

// ADMIN CRM PAGES
import AdminCRMDashboard from "./pages/admin/crm/Dashboard";
import CustomerDetails from "./pages/admin/crm/CustomerDetails";
import ServiceRequests from "./pages/admin/crm/ServiceRequests";
import CRMNotifications from "./pages/admin/crm/Notifications";

// ADMIN SALES PAGES
import AdminSalesDashboard from "./pages/admin/sales/Dashboard";
// Leads
import Leads from "./pages/admin/sales/Leads/Leads";
import LeadDetails from "./pages/admin/sales/Leads/LeadDetails";
import DownloadLead from "./pages/admin/sales/Leads/DownloadLead";
// Stock
import StockEntry from "./pages/admin/sales/Stock/StockEntry";
import StockSummary from "./pages/admin/sales/Stock/StockSummary";
import StockReport from "./pages/admin/sales/Stock Report/StockReport";
// Invoice
import NewInvoice from "./pages/admin/sales/Invoice/NewInvoice";
import InvoiceHistory from "./pages/admin/sales/Invoice/InvoiceHistory";
// Project
import Projects from "./pages/admin/sales/Project/Projects";
// Advertisement
import AddAdvertisement from "./pages/admin/sales/Advertisement/AddAdvertisement";
import AdvertisementList from "./pages/admin/sales/Advertisement/AdvertisementList";
// Activity Report
import ActivityReport from "./pages/admin/sales/ActivityReport/Reports";

// CUSTOMER PAGES
import CustomerDashboard from "./pages/customer/Dashboard";
import Invoices from "./pages/customer/Invoices";
import Tickets from "./pages/customer/Tickets";
import Profile from "./pages/customer/Profile";
import Support from "./pages/customer/Support";
import Notifications from "./pages/customer/Notifications";
import CustomizeProject from "./pages/customer/CustomizeProject";
import MyProjects from "./pages/customer/MyProjects";


//home,reg,login,forgotpassword
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP"; // added
import ResetPassword from "./pages/ResetPassword"; // added


function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES (NO LAYOUT) */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ADMIN CRM ROUTES (WITH SIDEBAR + NAVBAR) */}
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
        <Route
          path="/admin/crm/notifications"
          element={
            <MainLayout>
              <CRMNotifications />
            </MainLayout>
          }
        />

        {/* ADMIN SALES ROUTES (WITH SIDEBAR + NAVBAR) */}
        <Route
          path="/admin/sales/dashboard"
          element={
            <MainLayout>
              <AdminSalesDashboard />
            </MainLayout>
          }
        />

        {/* Leads Routes */}
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
          path="/admin/sales/leads/download-lead"
          element={
            <MainLayout>
              <DownloadLead />
            </MainLayout>
          }
        />

        {/* Stock Routes */}
        <Route
          path="/admin/sales/stock/entry"
          element={
            <MainLayout>
              <StockEntry />
            </MainLayout>
          }
        />
        <Route
          path="/admin/sales/stock/summary"
          element={
            <MainLayout>
              <StockSummary />
            </MainLayout>
          }
        />
        <Route
          path="/admin/sales/stock/report"
          element={
            <MainLayout>
              <StockReport />
            </MainLayout>
          }
        />

        {/* Invoice Routes */}
        <Route
          path="/admin/sales/invoice/new"
          element={
            <MainLayout>
              <NewInvoice />
            </MainLayout>
          }
        />
        <Route
          path="/admin/sales/invoice/history"
          element={
            <MainLayout>
              <InvoiceHistory />
            </MainLayout>
          }
        />

        {/* Project Route */}
        <Route
          path="/admin/sales/project"
          element={
            <MainLayout>
              <Projects />
            </MainLayout>
          }
        />

        {/* Advertisement Routes */}
        <Route
          path="/admin/sales/advertisement/add"
          element={
            <MainLayout>
              <AddAdvertisement />
            </MainLayout>
          }
        />
        <Route
          path="/admin/sales/advertisement/list"
          element={
            <MainLayout>
              <AdvertisementList />
            </MainLayout>
          }
        />

        {/* Activity Report Routes */}
        <Route
          path="/admin/sales/activity-report"
          element={
            <MainLayout>
              <ActivityReport />
            </MainLayout>
          }
        />

        {/* CUSTOMER ROUTES (WITH SIDEBAR + NAVBAR) */}
        <Route
          path="/customer/dashboard"
          element={
            <MainLayout role="customer">
              <CustomerDashboard />
            </MainLayout>
          }
        />
        <Route
          path="/customer/invoices"
          element={
            <MainLayout role="customer">
              <Invoices />
            </MainLayout>
          }
        />
        <Route
          path="/customer/tickets"
          element={
            <MainLayout role="customer">
              <Tickets />
            </MainLayout>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <MainLayout role="customer">
              <Profile />
            </MainLayout>
          }
        />
        <Route
          path="/customer/support"
          element={
            <MainLayout role="customer">
              <Support />
            </MainLayout>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <MainLayout role="customer">
              <Notifications />
            </MainLayout>
          }
        />
        <Route
          path="/customer/customize-project"
          element={
            <MainLayout role="customer">
              <CustomizeProject />
            </MainLayout>
          }
        />
        <Route
          path="/customer/my-projects"
          element={
            <MainLayout role="customer">
              <MyProjects />
            </MainLayout>
          }
        />
      </Routes>
    );
  }
  
  export default App;