import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { getStockEntries, getStockSummary } from "../../../../services/stockService";

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

function ReportCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function PaginationMock({ compact = false }) {
  return (
    <div className="flex items-center justify-end gap-2 text-xs text-gray-500 mt-2">
      {compact ? <span>1</span> : <span>1</span>}
      {!compact && <span>2</span>}
      {!compact && <span>3</span>}
      <button className="text-gray-400 hover:text-gray-600" type="button">
        ❯
      </button>
    </div>
  );
}

export default function StockReport() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supplier, setSupplier] = useState("All Suppliers");
  const [category, setCategory] = useState("Iot products");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedSupplier, setAppliedSupplier] = useState("All Suppliers");
  const [appliedCategory, setAppliedCategory] = useState("Iot products");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [reportReady, setReportReady] = useState(false);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        setError("");

        const [entriesRes, summaryRes] = await Promise.all([
          getStockEntries(),
          getStockSummary(),
        ]);

        const normalizedEntries = (entriesRes?.data || []).map((entry) => ({
          _id: entry._id,
          item: entry.itemName || "-",
          supplier: entry.supplier || "Unknown Supplier",
          category: entry.category || "None",
          quantity: Number(entry.quantity) || 0,
          unitPrice: Number(entry.price) || 0,
          total: (Number(entry.quantity) || 0) * (Number(entry.price) || 0),
          entryDate: entry.entryDate || entry.date || entry.createdAt || null,
        }));

        const normalizedSummary = (summaryRes?.data || []).map((item) => ({
          item: item.itemName || "-",
          category: item.category || "None",
          remaining: Number(item.availableQty ?? item.remaining ?? 0) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          totalValue:
            Number(item.totalValue) ||
            (Number(item.availableQty ?? item.remaining ?? 0) || 0) * (Number(item.unitPrice) || 0),
        }));

        const timestamps = normalizedEntries
          .map((row) => (row.entryDate ? new Date(row.entryDate).getTime() : NaN))
          .filter((value) => Number.isFinite(value));

        if (timestamps.length > 0) {
          const minDate = new Date(Math.min(...timestamps)).toISOString().slice(0, 10);
          const maxDate = new Date(Math.max(...timestamps)).toISOString().slice(0, 10);
          setFromDate(minDate);
          setToDate(maxDate);
          setAppliedFromDate(minDate);
          setAppliedToDate(maxDate);
        }

        setEntries(normalizedEntries);
        setSummary(normalizedSummary);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Failed to load stock report data");
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const suppliers = useMemo(() => {
    return ["All Suppliers", ...new Set(entries.map((row) => row.supplier).filter(Boolean))];
  }, [entries]);

  const matchesCategory = (rowCategory, selectedCategory) => {
    if (!selectedCategory) return true;
    return String(rowCategory || "").trim().toLowerCase() === String(selectedCategory || "").trim().toLowerCase();
  };

  const toDisplayDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isWithinDateRange = (value) => {
    if (!value) return true;
    const ts = new Date(value).getTime();
    if (!Number.isFinite(ts)) return true;
    const fromTs = appliedFromDate ? new Date(appliedFromDate).setHours(0, 0, 0, 0) : null;
    const toTs = appliedToDate ? new Date(appliedToDate).setHours(23, 59, 59, 999) : null;

    if (fromTs && ts < fromTs) return false;
    if (toTs && ts > toTs) return false;
    return true;
  };

  const filteredDateWise = useMemo(() => {
    return entries.filter((row) => {
      const byCategory = matchesCategory(row.category, appliedCategory);
      const byDate = isWithinDateRange(row.entryDate);
      return byCategory && byDate;
    });
  }, [entries, appliedCategory, appliedFromDate, appliedToDate]);

  const filteredSupplierWise = useMemo(() => {
    return filteredDateWise.filter((row) => {
      const bySupplier = appliedSupplier === "All Suppliers" || row.supplier === appliedSupplier;
      return bySupplier;
    });
  }, [filteredDateWise, appliedSupplier]);

  const lowStockData = useMemo(() => {
    return summary
      .filter((row) => matchesCategory(row.category, appliedCategory) && row.remaining > 0 && row.remaining <= 5)
      .map((row) => ({ item: row.item, category: row.category, status: "Low Stock" }));
  }, [summary, appliedCategory]);

  const stockValueData = useMemo(() => {
    return summary
      .filter((row) => matchesCategory(row.category, appliedCategory))
      .map((row) => ({
        item: row.item,
        quantity: row.remaining,
        unitPrice: row.unitPrice,
        totalValue: row.totalValue,
      }));
  }, [summary, appliedCategory]);

  const dateGrandTotal = filteredDateWise.reduce((sum, row) => sum + row.total, 0);
  const supplierGrandTotal = filteredSupplierWise.reduce((sum, row) => sum + row.total, 0);
  const lowStockGrandTotal = summary
    .filter((row) => matchesCategory(row.category, appliedCategory) && row.remaining > 0 && row.remaining <= 5)
    .reduce((sum, row) => sum + row.totalValue, 0);
  const stockValueGrandTotal = stockValueData.reduce((sum, row) => sum + row.totalValue, 0);

  const escapeCsvValue = (value) => {
    const text = String(value ?? "");
    if (text.includes('"') || text.includes(",") || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    const typedCategory = String(category || "").trim();

    if (!typedCategory) {
      setError("Category is required");
      setReportReady(false);
      return;
    }

    if (!fromDate || !toDate) {
      setError("Both From date and To date are required");
      setReportReady(false);
      return;
    }

    if (fromDate && toDate && new Date(fromDate).getTime() > new Date(toDate).getTime()) {
      setError("From date cannot be after To date");
      setReportReady(false);
      return;
    }

    setError("");
    setAppliedSupplier(supplier);
    setAppliedCategory(typedCategory);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setReportReady(true);
  };

  const handleExportExcel = () => {
    const rows = [];
    rows.push(["Stock Report"]);
    rows.push(["Supplier", appliedSupplier, "Category", appliedCategory || "-"]);
    rows.push(["From Date", appliedFromDate || "-", "To Date", appliedToDate || "-"]);
    rows.push([]);

    rows.push(["Date-wise Stock Report"]);
    rows.push(["Date", "Item", "Category", "Qty Added", "Unit Price", "Total"]);
    filteredDateWise.forEach((row) => {
      rows.push([
        toDisplayDate(row.entryDate),
        row.item,
        row.category,
        row.quantity,
        row.unitPrice,
        row.total,
      ]);
    });
    rows.push(["", "", "", "", "Grand Total", dateGrandTotal]);
    rows.push([]);

    rows.push(["Supplier-wise Report"]);
    rows.push(["Supplier", "Item", "Quantity", "Total Amount"]);
    filteredSupplierWise.forEach((row) => {
      rows.push([row.supplier, row.item, row.quantity, row.total]);
    });
    rows.push(["", "", "Grand Total", supplierGrandTotal]);
    rows.push([]);

    rows.push(["Stock Value Report"]);
    rows.push(["Item", "Quantity", "Unit Price", "Total Value"]);
    stockValueData.forEach((row) => {
      rows.push([row.item, row.quantity, row.unitPrice, row.totalValue]);
    });
    rows.push(["", "", "Grand Total", stockValueGrandTotal]);

    const csvContent = rows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const fileDate = new Date().toISOString().slice(0, 10);
    downloadFile(`\uFEFF${csvContent}`, `stock-report-${fileDate}.csv`, "text/csv;charset=utf-8;");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 36;
    const lineHeight = 16;
    let y = margin;

    const addLine = (text = "", bold = false) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(String(text), pageWidth - margin * 2);
      lines.forEach((line) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    addLine("Stock Report", true);
    addLine(`Supplier: ${appliedSupplier}`);
    addLine(`Category: ${appliedCategory || "-"}`);
    addLine(`Date Range: ${appliedFromDate || "-"} to ${appliedToDate || "-"}`);
    addLine("");

    addLine("Date-wise Stock Report", true);
    filteredDateWise.forEach((row) => {
      addLine(`${toDisplayDate(row.entryDate)} | ${row.item} | ${row.category} | Qty: ${row.quantity} | Unit: INR ${row.unitPrice} | Total: INR ${row.total}`);
    });
    addLine(`Grand Total: INR ${dateGrandTotal}`);
    addLine("");

    addLine("Supplier-wise Report", true);
    filteredSupplierWise.forEach((row) => {
      addLine(`${row.supplier} | ${row.item} | Qty: ${row.quantity} | Total: INR ${row.total}`);
    });
    addLine(`Grand Total: INR ${supplierGrandTotal}`);
    addLine("");

    addLine("Stock Value Report", true);
    stockValueData.forEach((row) => {
      addLine(`${row.item} | Qty: ${row.quantity} | Unit: INR ${row.unitPrice} | Total: INR ${row.totalValue}`);
    });
    addLine(`Grand Total: INR ${stockValueGrandTotal}`);

    const fileDate = new Date().toISOString().slice(0, 10);
    doc.save(`stock-report-${fileDate}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-2xl font-semibold text-gray-800">Stock Report</h2>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-light border text-sm"
              onClick={handleDownloadPdf}
              disabled={loading || !reportReady}
            >
              📄 Download PDF
            </button>
            <button
              type="button"
              className="btn btn-light border text-sm"
              onClick={handleExportExcel}
              disabled={loading || !reportReady}
            >
              🟩 Export Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
            <select
              className="form-control"
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
            >
              {suppliers.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <input
              type="text"
              className="form-control"
              value={category}
              placeholder="Enter category"
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
              <span className="text-gray-500 text-sm">→</span>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              className="btn btn-success w-full"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

      {!reportReady && !loading && (
        <div className="alert alert-info py-2 mb-3">
          Select supplier, enter category, choose date range, then click Generate Report.
        </div>
      )}

      {reportReady && (
      <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-3">
        <ReportCard title="Date-wise Stock Report">
          <div className="overflow-x-auto">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th className="text-end">Qty Added</th>
                  <th className="text-end">Unit Price</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">Loading stock data...</td>
                  </tr>
                ) : filteredDateWise.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No stock entries found.</td>
                  </tr>
                ) : filteredDateWise.map((row) => (
                  <tr key={row._id || `${row.entryDate}-${row.item}`}>
                    <td>{toDisplayDate(row.entryDate)}</td>
                    <td>{row.item}</td>
                    <td>{row.category}</td>
                    <td className="text-end">{row.quantity}</td>
                    <td className="text-end">{formatCurrency(row.unitPrice)}</td>
                    <td className="text-end">{formatCurrency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
            <p className="text-sm font-semibold text-emerald-700 mb-0">Grand Total: {formatCurrency(dateGrandTotal)}</p>
            <PaginationMock />
          </div>
        </ReportCard>

        <ReportCard title="Supplier-wise Report">
          <div className="overflow-x-auto">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Supplier</th>
                  <th>Item</th>
                  <th className="text-end">Quantity</th>
                  <th className="text-end">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">Loading supplier report...</td>
                  </tr>
                ) : filteredSupplierWise.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No supplier entries found.</td>
                  </tr>
                ) : filteredSupplierWise.map((row) => (
                  <tr key={`${row.supplier}-${row.item}`}>
                    <td>{row.supplier}</td>
                    <td>{row.item}</td>
                    <td className="text-end">{row.quantity}</td>
                    <td className="text-end">{formatCurrency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
            <p className="text-sm font-semibold text-gray-700 mb-0">Grand Total: {formatCurrency(supplierGrandTotal)}</p>
            <PaginationMock />
          </div>
        </ReportCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-3">
          <ReportCard title="Low Stock Report">
            <div className="overflow-x-auto">
              <table className="table table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">Loading low stock data...</td>
                    </tr>
                  ) : lowStockData.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">No low stock items.</td>
                    </tr>
                  ) : lowStockData.map((row) => (
                    <tr key={row.item}>
                      <td>{row.item}</td>
                      <td>{row.category}</td>
                      <td>
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-700 font-medium">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
              <p className="text-sm font-semibold text-emerald-700 mb-0">Grand Total: {formatCurrency(lowStockGrandTotal)}</p>
              <PaginationMock compact />
            </div>
          </ReportCard>
        </div>

        <div className="xl:col-span-9">
          <ReportCard title="Stock Value Report">
            <div className="overflow-x-auto">
              <table className="table table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th className="text-end">Quantity</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">Loading stock value report...</td>
                    </tr>
                  ) : stockValueData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No stock value data found.</td>
                    </tr>
                  ) : stockValueData.map((row) => (
                    <tr key={row.item}>
                      <td>{row.item}</td>
                      <td className="text-end">{row.quantity}</td>
                      <td className="text-end">{formatCurrency(row.unitPrice)}</td>
                      <td className="text-end">{formatCurrency(row.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm font-semibold text-gray-700 border-t border-gray-200 pt-2 mt-2 mb-0 text-end">
              Grand Total: {formatCurrency(stockValueGrandTotal)}
            </p>
          </ReportCard>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
