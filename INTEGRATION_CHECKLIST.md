# 📋 Integration Checklist for Other Team Members

Use this checklist when integrating UI components into your pages.

---

## Member 2 - Admin Sales Module

### Dashboard Page
- [ ] Wrap page with `<MainLayout title="Sales Dashboard" role="admin">`
- [ ] Import `Table`, `Chart`, `Loader` components
- [ ] Use `<Table>` for lists (Stock, Leads, Deals, Reports)
- [ ] Use `<Chart>` for activity/sales trends
- [ ] Add status badges for item statuses
- [ ] Use `.dashboard-grid` for stat cards
- [ ] Use `.dashboard-section` for content sections

### Sub-pages (Stock, Leads, Deals, etc.)
- [ ] Wrap with MainLayout
- [ ] Use Table component with searchable and paginated props
- [ ] Add action buttons (Edit, Delete) via `actionColumn` prop
- [ ] Use status badges for statuses
- [ ] Add breadcrumbs for navigation

### Forms (Add/Edit)
- [ ] Use `.form-label` for labels
- [ ] Use `.form-control` for text inputs
- [ ] Use `.form-select` for dropdowns
- [ ] Use `.btn btn-primary` for submit
- [ ] Use `.btn btn-secondary` for cancel
- [ ] Add validation feedback

---

## Member 3 - Admin CRM Module

### Dashboard Page
- [ ] Wrap page with `<MainLayout title="CRM Dashboard" role="admin">`
- [ ] Display customer count stats using stat cards
- [ ] Use Table for customer list
- [ ] Use Chart for customer trends
- [ ] Add alerts for pending items

### Customer Management
- [ ] Use Table component for customer list
- [ ] Add search functionality
- [ ] Add pagination
- [ ] Use action buttons (View, Edit)
- [ ] Use status badges for customer status

### Service Requests / Complaints
- [ ] Use Table for requests list
- [ ] Add status filter/badges
- [ ] Use action buttons for status updates
- [ ] Add timeline for complaint progress

### Forms
- [ ] Follow form pattern from Member 2
- [ ] Use status dropdown for status updates
- [ ] Add text area for notes/comments
- [ ] Use validation

---

## Member 4 - Customer Portal

### Dashboard Page
- [ ] Wrap page with `<MainLayout title="My Dashboard" role="customer">`
- [ ] Use stat cards for important metrics
- [ ] Use alerts for notifications
- [ ] Add quick links as cards
- [ ] Keep layout clean and minimal

### Invoices Page
- [ ] Use Table for invoice list
- [ ] Make searchable
- [ ] Add "Download" action button
- [ ] Use status badges
- [ ] Add amount formatting

### Tickets / Support
- [ ] Use Table for ticket list
- [ ] Show ticket status with badges
- [ ] Add "View Details" button
- [ ] Use alert for unresolved tickets

### Profile Page
- [ ] Create form with customer info
- [ ] Use form controls from Member 5
- [ ] Add edit/save buttons
- [ ] Show profile image placeholder

### Notifications / Support
- [ ] Use Table or list for items
- [ ] Show dates properly formatted
- [ ] Add read/unread indicators
- [ ] Use appropriate icons

---

## General Integration Steps

### Step 1: Setup Page Structure
```jsx
import MainLayout from "../components/layout/MainLayout";

export default function YourPage() {
  return (
    <MainLayout title="Page Title" role="admin">
      {/* Your content here */}
    </MainLayout>
  );
}
```

### Step 2: Add Components
```jsx
import { Table, Chart, Loader } from "../components";
// OR
import Table from "../components/common/Table";
import Chart from "../components/common/Chart";
import Loader from "../components/common/Loader";
```

### Step 3: Prepare Your Data
```jsx
const data = [
  { id: 1, name: "Item 1", status: "Active" },
  { id: 2, name: "Item 2", status: "Pending" },
];
```

### Step 4: Add Table/Chart
```jsx
<Table
  columns={["name", "status"]}
  data={data}
  searchable={true}
  paginated={true}
  actionColumn={(row) => <button>Edit</button>}
/>
```

### Step 5: Style with Dashboard Classes
```jsx
<div className="dashboard-section">
  <h2 className="dashboard-section-title">Section Title</h2>
  {/* Your content */}
</div>

<div className="dashboard-grid">
  {/* Stat cards */}
</div>
```

### Step 6: Add Status Badges
```jsx
<span className="status-badge active">Active</span>
<span className="status-badge pending">Pending</span>
```

---

## Component Props Cheat Sheet

### MainLayout
```jsx
title=""                    // String - Page title
role="admin"               // "admin" | "customer"
onLogout={() => {}}        // Function - Called on logout
showBreadcrumb={false}     // Boolean - Show breadcrumb
breadcrumbs={[]}          // Array - Breadcrumb items
```

### Table
```jsx
columns={[]}              // Array - Column names
data={[]}                // Array - Row data
title=""                 // String - Table title
searchable={false}       // Boolean - Enable search
sortable={true}          // Boolean - Enable sorting
paginated={false}        // Boolean - Enable pagination
itemsPerPage={10}        // Number - Items per page
onRowClick={() => {}}    // Function - Row click handler
actionColumn={() => {}}  // Function - Action buttons
rowClassName={() => ""} // Function - Row CSS class
cellClassName={() => {}}// Function - Cell CSS class
```

### Chart
```jsx
title=""                // String - Chart title
description=""         // String - Chart description
data={[]}             // Array - Chart data
stats={{}}            // Object - Statistics
height={300}          // Number - Chart height (px)
onRefresh={() => {}}  // Function - Refresh handler
loading={false}       // Boolean - Loading state
```

### Loader
```jsx
size="medium"          // "small" | "medium" | "large"
message="Loading..."   // String - Loading message
fullScreen={false}     // Boolean - Full screen overlay
overlay={true}        // Boolean - Semi-transparent background
```

---

## CSS Classes Reference

### Layout
```css
.main-layout-wrapper        /* Main layout container */
.sidebar-column            /* Sidebar area */
.content-column            /* Main content area */
.main-content              /* Content wrapper */
.breadcrumb-nav            /* Breadcrumb navigation */
```

### Dashboard
```css
.dashboard-section         /* Section container */
.dashboard-section-title   /* Section title */
.dashboard-grid           /* Auto-responsive grid */
.stat-card               /* Statistic card */
.stat-icon               /* Icon in stat card */
```

### Forms
```css
.form-label              /* Form label */
.form-control            /* Text input */
.form-select            /* Dropdown select */
.mb-3                   /* Margin bottom utility */
.d-flex                 /* Flexbox utility */
.gap-2                  /* Gap utility */
```

### Buttons
```css
.btn .btn-primary       /* Primary blue button */
.btn .btn-secondary     /* Gray secondary button */
.btn .btn-success       /* Green success button */
.btn .btn-danger        /* Red danger button */
.btn-sm                /* Small button */
```

### Status Badges
```css
.status-badge.active    /* Green badge */
.status-badge.pending   /* Yellow badge */
.status-badge.completed /* Blue badge */
.status-badge.rejected  /* Red badge */
```

### Utilities
```css
.text-muted            /* Muted gray text */
.me-2                  /* Margin end (right) */
.mt-4                  /* Margin top */
.p-3                   /* Padding */
.bg-light              /* Light background */
.rounded               /* Rounded corners */
.shadow                /* Box shadow */
```

---

## Common Patterns

### Display Loading State
```jsx
if (loading) {
  return <Loader size="large" message="Loading..." />;
}
```

### Handle Errors
```jsx
if (error) {
  return (
    <div className="alert alert-danger">
      Error: {error.message}
    </div>
  );
}
```

### Empty State
```jsx
if (data.length === 0) {
  return (
    <div className="alert alert-info">
      No data available. Start by creating a new item.
    </div>
  );
}
```

### Card with Stats
```jsx
<div className="dashboard-grid">
  <div className="card stat-card">
    <div className="card-body">
      <div className="stat-icon">📊</div>
      <h4>{value}</h4>
      <p className="text-muted">{label}</p>
    </div>
  </div>
</div>
```

### Form with Validation
```jsx
<form onSubmit={handleSubmit}>
  <div className="mb-3">
    <label className="form-label">Field Name</label>
    <input
      type="text"
      className="form-control"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
    />
  </div>
  <button type="submit" className="btn btn-primary">
    Submit
  </button>
</form>
```

---

## Testing Your Integration

- [ ] Component renders without errors
- [ ] Mobile view works correctly
- [ ] Table search works
- [ ] Table sort works (click headers)
- [ ] Pagination works
- [ ] Sidebar menu highlights active page
- [ ] Navbar shows correct role
- [ ] Logout button works
- [ ] All buttons are clickable
- [ ] Forms submit correctly
- [ ] Status badges display correctly
- [ ] Responsive design works on mobile

---

## Troubleshooting

**Q: Components not showing?**
- A: Check if MainLayout is imported and wrapping the page
- Check if CSS files are imported in App.js

**Q: Styles not applying?**
- A: Ensure Bootstrap CSS is imported
- Check CSS import order in App.js
- Clear browser cache

**Q: Table not sorting?**
- A: Ensure `sortable={true}` prop is set
- Make sure column names match data keys

**Q: Sidebar not showing menu?**
- A: Check role prop ("admin" or "customer")
- Verify role-based menu items are defined

**Q: Responsive not working?**
- A: Check if viewport meta tag exists in index.html
- Ensure CSS media queries are loaded

---

## Need Help?

- Check MEMBER5_UI_DOCUMENTATION.md for full API reference
- See COMPONENT_EXAMPLES.jsx for working examples
- Review QUICK_START_UI.md for quick tips

---

**Happy Coding! 🚀**
