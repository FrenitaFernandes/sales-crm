// Example: Integration Guide for UI Components
// This file demonstrates how to use all Member 5 components together

import MainLayout from "../components/layout/MainLayout";
import Table from "../components/common/Table";
import Chart from "../components/common/Chart";
import Loader from "../components/common/Loader";
import { useState, useEffect } from "react";

/**
 * EXAMPLE 1: Admin Sales Dashboard
 * Shows complete integration of all UI components
 */
export function AdminSalesDashboardExample() {
  const [role] = useState("admin");
  const [loading, setLoading] = useState(false);

  // Dummy sales data
  const salesData = [
    { id: 1, product: "Product A", amount: 5000, date: "2024-01-15", status: "Completed" },
    { id: 2, product: "Product B", amount: 3200, date: "2024-01-14", status: "Pending" },
    { id: 3, product: "Product C", amount: 7800, date: "2024-01-13", status: "Active" },
    { id: 4, product: "Product D", amount: 2100, date: "2024-01-12", status: "Completed" },
    { id: 5, product: "Product E", amount: 4500, date: "2024-01-11", status: "Rejected" },
  ];

  // Chart data
  const chartData = [
    { label: "Week 1", value: 15000, color: "#2563eb" },
    { label: "Week 2", value: 20000, color: "#10b981" },
    { label: "Week 3", value: 18000, color: "#f59e0b" },
    { label: "Week 4", value: 25000, color: "#dc2626" },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <MainLayout
      title="Sales Dashboard"
      role={role}
      showBreadcrumb={true}
      breadcrumbs={[
        { label: "Home", path: "/" },
        { label: "Admin", path: "/admin" },
        { label: "Sales" },
      ]}
    >
      {/* Header Section */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">📊 Sales Overview</h2>

        {/* Stat Cards Grid */}
        <div className="dashboard-grid">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">📈</div>
              <h4>Total Sales</h4>
              <p className="text-muted">$50,200</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">🎯</div>
              <h4>Target Met</h4>
              <p className="text-muted">85%</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">📦</div>
              <h4>Products Sold</h4>
              <p className="text-muted">1,245</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">👥</div>
              <h4>Customers</h4>
              <p className="text-muted">342</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">📈 Weekly Performance</h2>
        <Chart
          title="Sales Trend"
          description="Sales performance for the last 4 weeks"
          data={chartData}
          stats={{
            Total: "$78,000",
            Average: "$19,500",
            Peak: "Week 4",
          }}
          height={350}
          onRefresh={handleRefresh}
          loading={loading}
        />
      </div>

      {/* Table Section */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">💼 Recent Sales</h2>
        <Table
          columns={["product", "amount", "date", "status"]}
          data={salesData}
          title="Sales Transactions"
          searchable={true}
          sortable={true}
          paginated={true}
          itemsPerPage={3}
          onRowClick={(row) => console.log("Clicked:", row)}
          rowClassName={(row) => {
            if (row.status === "Completed") return "table-row-success";
            if (row.status === "Rejected") return "table-row-error";
            return "";
          }}
          actionColumn={(row) => (
            <>
              <button className="btn btn-sm btn-primary me-2">Edit</button>
              <button className="btn btn-sm btn-danger">Delete</button>
            </>
          )}
        />
      </div>
    </MainLayout>
  );
}

/**
 * EXAMPLE 2: Customer Portal
 * Shows customer-focused UI with simpler layout
 */
export function CustomerPortalExample() {
  const [role] = useState("customer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const invoices = [
    { id: "INV-001", amount: 1500, date: "2024-01-01", status: "Paid" },
    { id: "INV-002", amount: 2300, date: "2024-01-08", status: "Pending" },
    { id: "INV-003", amount: 890, date: "2024-01-15", status: "Paid" },
  ];

  if (loading) {
    return (
      <Loader
        size="large"
        message="Loading your portal..."
        fullScreen={true}
        overlay={true}
      />
    );
  }

  return (
    <MainLayout
      title="My Dashboard"
      role={role}
      showBreadcrumb={true}
      breadcrumbs={[{ label: "Home", path: "/" }, { label: "Dashboard" }]}
    >
      {/* Welcome Section */}
      <div className="dashboard-section">
        <div className="alert alert-info">
          <strong>Welcome!</strong> You have 3 active tickets and 1 pending invoice.
        </div>

        <div className="dashboard-grid">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">💰</div>
              <h4>$3,690</h4>
              <p className="text-muted">Total Spent</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">🎫</div>
              <h4>3</h4>
              <p className="text-muted">Active Tickets</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">📬</div>
              <h4>1</h4>
              <p className="text-muted">Pending Invoice</p>
            </div>
          </div>

          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">⭐</div>
              <h4>4.8</h4>
              <p className="text-muted">Your Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">📄 My Invoices</h2>
        <Table
          columns={["id", "amount", "date", "status"]}
          data={invoices}
          searchable={true}
          paginated={false}
          actionColumn={(row) => (
            <button className="btn btn-sm btn-primary">Download</button>
          )}
        />
      </div>

      {/* Quick Links */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">✨ Quick Links</h2>
        <div className="dashboard-grid">
          <div className="card quick-link-card">
            <div className="card-body">
              <div style={{ fontSize: "32px" }}>🎫</div>
              <h5>View Tickets</h5>
            </div>
          </div>

          <div className="card quick-link-card">
            <div className="card-body">
              <div style={{ fontSize: "32px" }}>💬</div>
              <h5>Contact Support</h5>
            </div>
          </div>

          <div className="card quick-link-card">
            <div className="card-body">
              <div style={{ fontSize: "32px" }}>👤</div>
              <h5>Edit Profile</h5>
            </div>
          </div>

          <div className="card quick-link-card">
            <div className="card-body">
              <div style={{ fontSize: "32px" }}>🔔</div>
              <h5>Notifications</h5>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/**
 * EXAMPLE 3: Using Loader Component Variants
 */
export function LoaderExamplesComponent() {
  return (
    <MainLayout title="Loader Examples" role="admin">
      <div className="row">
        <div className="col-md-6">
          <h5>Small Loader</h5>
          <Loader size="small" message="Loading..." />
        </div>
        <div className="col-md-6">
          <h5>Medium Loader</h5>
          <Loader size="medium" message="Please wait..." />
        </div>
        <div className="col-md-6 mt-4">
          <h5>Large Loader</h5>
          <Loader size="large" message="Fetching data..." />
        </div>
      </div>
    </MainLayout>
  );
}

/**
 * EXAMPLE 4: Status Badges Usage
 */
export function StatusBadgesExample() {
  return (
    <MainLayout title="Status Indicators" role="admin">
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Status Badges</h2>

        <div className="p-3 bg-light rounded">
          <p>
            <span className="status-badge active">Active</span>
          </p>
          <p>
            <span className="status-badge pending">Pending</span>
          </p>
          <p>
            <span className="status-badge completed">Completed</span>
          </p>
          <p>
            <span className="status-badge rejected">Rejected</span>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

/**
 * EXAMPLE 5: Form Integration
 */
export function FormIntegrationExample() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "pending",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <MainLayout title="Form Example" role="admin">
      <div className="dashboard-section">
        <div className="card p-4">
          <h5>Sample Form</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
              <button type="reset" className="btn btn-secondary">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
