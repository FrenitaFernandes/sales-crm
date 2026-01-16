# Member 5 - UI Layout, Integration & Reports Documentation

## Overview
Member 5 is responsible for the UI/UX layer - providing reusable components, consistent styling, role-based navigation, and the integration framework that ties all modules together.

## ✅ Implemented Components

### Layout Components

#### 1. **MainLayout.jsx**
- Main wrapper component for all pages
- Manages sidebar and navbar integration
- Responsive design with mobile hamburger menu
- Breadcrumb navigation support
- Sidebar overlay for mobile devices

**Props:**
```jsx
<MainLayout
  title="Dashboard"           // Page title (shown in navbar)
  role="admin"               // "admin" or "customer"
  onLogout={handleLogout}    // Logout callback
  showBreadcrumb={true}      // Show breadcrumb nav
  breadcrumbs={[
    { label: "Home", path: "/" },
    { label: "Dashboard" }
  ]}
>
  {/* Page content */}
</MainLayout>
```

#### 2. **Navbar.jsx**
- Top navigation bar with branding
- Notification bell with badge
- User profile dropdown with logout
- Mobile hamburger menu toggle
- Responsive design

**Features:**
- Dynamic notification count
- Profile menu dropdown
- Logout functionality
- Mobile toggle button

#### 3. **Sidebar.jsx**
- Role-based navigation menu
- Collapsible sections for admin/customer
- Active link highlighting
- Icon-based menu items
- Smooth animations

**Supported Roles:**
- `admin` - Shows both Sales and CRM menus
- `customer` - Shows Customer portal menu

### Common Components

#### 4. **Table.jsx**
Advanced data table with multiple features:
- **Sorting:** Click column headers to sort
- **Searching:** Built-in search functionality
- **Pagination:** Page-by-page data display
- **Actions:** Configurable action buttons per row
- **Responsive:** Horizontal scroll on mobile

**Props:**
```jsx
<Table
  columns={["Name", "Email", "Status"]}
  data={[
    { Name: "John", Email: "john@email.com", Status: "Active" },
    // ...
  ]}
  title="Users"
  searchable={true}
  sortable={true}
  paginated={true}
  itemsPerPage={10}
  onRowClick={(row) => console.log(row)}
  actionColumn={(row) => (
    <button onClick={() => editRow(row)}>Edit</button>
  )}
/>
```

**Features:**
- Column-level sorting with visual indicators
- Search across all data
- Customizable action buttons
- Row click callbacks
- Custom row/cell styling

#### 5. **Chart.jsx**
Flexible charting component:
- Bar chart visualization
- Refresh capability
- Statistics display
- Loading states
- Custom color support

**Props:**
```jsx
<Chart
  title="Sales Overview"
  description="Last 30 days"
  data={[
    { label: "Jan", value: 400, color: "#2563eb" },
    { label: "Feb", value: 300, color: "#10b981" },
  ]}
  stats={{ Total: 700, Average: 350 }}
  height={300}
  onRefresh={fetchData}
  loading={false}
/>
```

#### 6. **Loader.jsx**
Loading indicator component:
- Multiple sizes (small, medium, large)
- Full-screen option
- Custom message
- Overlay support
- Animated spinner

**Props:**
```jsx
<Loader
  size="medium"              // "small", "medium", "large"
  message="Loading..."       // Custom message
  fullScreen={false}         // Full-screen overlay
  overlay={true}            // Semi-transparent background
/>
```

## 🎨 CSS Files

### 1. **layout.css**
- Main layout structure
- Sidebar + Content column layout
- Responsive breakpoints
- Mobile sidebar overlay

### 2. **navbar.css**
- Navbar styling
- Icon buttons and dropdown menu
- Notification badge animations
- Mobile responsive navbar

### 3. **sidebar.css**
- Sidebar navigation styling
- Menu items and sections
- Active state styling
- Collapsible menu animations

### 4. **table.css**
- Table styling with borders
- Sortable header styling
- Search input styling
- Pagination controls
- Hover and active states

### 5. **chart.css**
- Chart container styling
- Bar chart visualization
- Loading spinner
- Statistics display
- Refresh button

### 6. **dashboard.css**
- Dashboard cards and grids
- Status badges (active, pending, completed, rejected)
- Form controls
- Buttons with hover effects
- Alert styling

### 7. **responsive.css**
- Grid utilities (2-col, 3-col, 4-col)
- Container utilities
- Padding utilities
- Mobile breakpoints

## 🎯 Usage Examples

### Admin Dashboard with Layout
```jsx
import MainLayout from "../components/layout/MainLayout";
import Table from "../components/common/Table";
import Chart from "../components/common/Chart";

export default function Dashboard() {
  const [role] = useState("admin");

  const dummyData = [
    { id: 1, name: "Product A", sales: 100, status: "Active" },
    { id: 2, name: "Product B", sales: 250, status: "Active" },
    { id: 3, name: "Product C", sales: 50, status: "Pending" },
  ];

  const chartData = [
    { label: "Week 1", value: 400 },
    { label: "Week 2", value: 600 },
    { label: "Week 3", value: 800 },
  ];

  return (
    <MainLayout title="Admin Dashboard" role={role}>
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Overview</h2>
        <Chart
          title="Sales Trend"
          data={chartData}
          stats={{ Total: 1800, Average: 600 }}
        />
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Recent Sales</h2>
        <Table
          columns={["name", "sales", "status"]}
          data={dummyData}
          searchable={true}
          paginated={true}
          itemsPerPage={5}
        />
      </div>
    </MainLayout>
  );
}
```

### Customer Portal
```jsx
import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/common/Loader";

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return <Loader size="large" message="Loading your dashboard..." />;
  }

  return (
    <MainLayout title="My Dashboard" role="customer">
      {/* Customer content */}
    </MainLayout>
  );
}
```

## 🎨 Styling System

### Color Palette
```css
--primary-color: #2563eb (Blue)
--secondary-color: #1e293b (Dark Slate)
--success-color: #10b981 (Green)
--danger-color: #dc2626 (Red)
--warning-color: #f59e0b (Amber)
--info-color: #0ea5e9 (Cyan)
--light-bg: #f8fafc (Light Gray)
--border-color: #e5e7eb (Gray)
--text-muted: #64748b (Muted Gray)
```

### Responsive Breakpoints
- **XS (Mobile):** 0px - 480px
- **SM:** 480px - 768px
- **MD:** 768px - 992px
- **LG:** 992px - 1200px
- **XL:** 1200px - 1400px
- **XXL:** 1400px+

## 🚀 Integration Points

### With Authentication (Member 1)
The layout components accept an `onLogout` prop that integrates with auth context:

```jsx
<MainLayout
  onLogout={() => {
    logoutUser();
    navigate("/login");
  }}
/>
```

### With Page Components (Members 2, 3, 4)
Simply wrap any page with `MainLayout`:

```jsx
<MainLayout title="Sales Dashboard" role="admin">
  <YourPageComponent />
</MainLayout>
```

### With Data Management
Pass data to Table and Chart components:

```jsx
<Table
  data={salesData}
  columns={["name", "amount", "date"]}
/>

<Chart data={monthlyStats} />
```

## ✨ Features Highlight

✅ **Role-Based Navigation** - Different menus for admin/customer
✅ **Responsive Design** - Works on all device sizes
✅ **Reusable Components** - Use Table, Chart, Loader anywhere
✅ **Consistent Styling** - Unified color scheme and spacing
✅ **Animations** - Smooth transitions and hover effects
✅ **Accessibility** - Semantic HTML and keyboard support
✅ **Mobile Optimized** - Touch-friendly and performant
✅ **Dark/Light Ready** - Easy to extend with themes

## 📱 Mobile Responsiveness

All components are fully responsive:
- Sidebar converts to hamburger menu on mobile
- Tables become scrollable on small screens
- Charts adjust height based on screen size
- Buttons and inputs are touch-optimized
- Navbar adapts font sizes for small screens

## 🔗 Integration with Other Members

1. **Member 1 (Auth):** Use `onLogout` prop and pass role to MainLayout
2. **Member 2 (Sales):** Wrap dashboard with MainLayout, use Table for lists
3. **Member 3 (CRM):** Use Table component for customer lists
4. **Member 4 (Customer):** Full integration with MainLayout for customer portal
5. **All Members:** Import and use layout styles in their pages

---

**Status:** ✅ Complete and ready for integration with other team members
