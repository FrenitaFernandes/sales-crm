// src/components/index.js
// Central export file for all UI components
// Import any component from here instead of long relative paths

// Layout Components
export { default as MainLayout } from "./layout/MainLayout";
export { default as Navbar } from "./layout/Navbar";
export { default as Sidebar } from "./layout/Sidebar";

// Common Components
export { default as Table } from "./common/Table";
export { default as Chart } from "./common/Chart";
export { default as Loader } from "./common/Loader";

/**
 * Usage Example:
 * 
 * import { MainLayout, Table, Chart, Loader } from "../components";
 * 
 * OR
 * 
 * import MainLayout from "../components/layout/MainLayout";
 * import Table from "../components/common/Table";
 */
