# 🚀 Quick Start Guide - Member 5 UI Components

## Get Started in 5 Minutes

### 1️⃣ Basic Page Setup

```jsx
import MainLayout from "../components/layout/MainLayout";

export default function MyPage() {
  return (
    <MainLayout 
      title="My Page" 
      role="admin"
    >
      {/* Your content here */}
    </MainLayout>
  );
}
```

---

### 2️⃣ Add a Table

```jsx
import Table from "../components/common/Table";

<Table
  columns={["Name", "Email", "Status"]}
  data={[
    { Name: "John", Email: "john@email.com", Status: "Active" },
    { Name: "Jane", Email: "jane@email.com", Status: "Pending" },
  ]}
  searchable={true}
  paginated={true}
/>
```

---

### 3️⃣ Add a Chart

```jsx
import Chart from "../components/common/Chart";

<Chart
  title="Sales Data"
  data={[
    { label: "Jan", value: 400 },
    { label: "Feb", value: 300 },
    { label: "Mar", value: 200 },
  ]}
  stats={{ Total: 900 }}
/>
```

---

### 4️⃣ Show Loading

```jsx
import Loader from "../components/common/Loader";

<Loader 
  size="large" 
  message="Loading your data..."
/>
```

---

### 5️⃣ Complete Example

```jsx
import MainLayout from "../components/layout/MainLayout";
import Table from "../components/common/Table";
import Chart from "../components/common/Chart";
import { useState } from "react";

export default function SalesDashboard() {
  const [role] = useState("admin");

  const data = [
    { id: 1, product: "A", amount: 100, status: "Active" },
    { id: 2, product: "B", amount: 200, status: "Pending" },
  ];

  const chart = [
    { label: "Week 1", value: 500 },
    { label: "Week 2", value: 700 },
  ];

  return (
    <MainLayout title="Sales Dashboard" role={role}>
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Overview</h2>
        <Chart title="Weekly Sales" data={chart} />
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Recent Sales</h2>
        <Table
          columns={["product", "amount", "status"]}
          data={data}
          searchable={true}
          paginated={true}
        />
      </div>
    </MainLayout>
  );
}
```

---

## 📚 Common Patterns

### Status Badge
```jsx
<span className="status-badge active">Active</span>
<span className="status-badge pending">Pending</span>
<span className="status-badge completed">Completed</span>
<span className="status-badge rejected">Rejected</span>
```

### Card Grid
```jsx
<div className="dashboard-grid">
  <div className="card stat-card">
    <div className="card-body">
      <div className="stat-icon">📊</div>
      <h4>1,234</h4>
      <p className="text-muted">Total Sales</p>
    </div>
  </div>
</div>
```

### Form Inputs
```jsx
<div className="mb-3">
  <label className="form-label">Name</label>
  <input type="text" className="form-control" />
</div>
```

### Buttons
```jsx
<button className="btn btn-primary">Submit</button>
<button className="btn btn-secondary">Cancel</button>
<button className="btn btn-danger">Delete</button>
```

---

## 🎨 Color Classes

```jsx
// Status badges
.status-badge.active        // Green
.status-badge.pending       // Yellow
.status-badge.completed     // Blue
.status-badge.rejected      // Red

// Buttons
.btn-primary                // Blue
.btn-secondary              // Gray
.btn-success                // Green
.btn-danger                 // Red

// Alerts
.alert-success              // Green
.alert-warning              // Yellow
.alert-danger               // Red
.alert-info                 // Cyan
```

---

## 📱 Responsive Classes

```jsx
// Grid utilities
<div className="dashboard-grid">
  {/* Auto-responsive columns */}
</div>

// Responsive text
<h2 className="dashboard-section-title">Title</h2>

// Mobile responsive table
<Table paginated={true} />
```

---

## 🔗 Integration with Other Members

### Member 1 (Auth) Integration
```jsx
<MainLayout 
  onLogout={() => {
    logoutUser();
    navigate("/login");
  }}
/>
```

### Member 2, 3, 4 Integration
Just wrap your page with MainLayout and use the components!

---

## ⚡ Pro Tips

1. **Always wrap pages with MainLayout** - It provides navigation and consistent layout

2. **Use role="admin" or role="customer"** - Changes sidebar menu automatically

3. **Make tables searchable** - Users love the search feature
   ```jsx
   <Table searchable={true} />
   ```

4. **Use paginated tables** - Better performance with large datasets
   ```jsx
   <Table paginated={true} itemsPerPage={10} />
   ```

5. **Add breadcrumbs** - Helps users navigate
   ```jsx
   <MainLayout 
     showBreadcrumb={true}
     breadcrumbs={[
       { label: "Home", path: "/" },
       { label: "Current Page" }
     ]}
   />
   ```

6. **Use status badges** - Better UX than plain text
   ```jsx
   <span className="status-badge active">Active</span>
   ```

7. **Add action buttons to tables** - Let users interact with data
   ```jsx
   <Table
     actionColumn={(row) => (
       <button className="btn btn-sm btn-primary">Edit</button>
     )}
   />
   ```

---

## 🆘 Common Questions

**Q: How do I change the colors?**
A: Edit the CSS variables in `src/styles/dashboard.css` at the `:root` section

**Q: Can I customize the sidebar menu?**
A: Yes! Edit `src/components/layout/Sidebar.jsx` and modify the `menus` object

**Q: How do I add more chart data?**
A: Pass an array to the `data` prop with `{ label, value, color }` objects

**Q: How do I make a column sortable?**
A: Table is sortable by default! Just click the column header

**Q: Can I add custom styling?**
A: Yes! Add classes or inline styles to components. All components support `className` and `style` props

---

## 📖 Full Documentation

See **MEMBER5_UI_DOCUMENTATION.md** for complete API reference and examples

---

**You're all set! Start building amazing UIs! 🎉**
