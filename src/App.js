import React from "react";
import "./App.css";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/admin/crm/Dashboard";

function App() {
  return (
    <MainLayout title="Admin CRM Dashboard">
      <Dashboard />
    </MainLayout>
  );
}

export default App;