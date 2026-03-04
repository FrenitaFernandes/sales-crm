import React, { useEffect, useState } from "react";
import { deleteStockEntry, getStockEntries, getStockSummary, updateStockEntry } from "../../../../services/stockService";

const StockSummary = () => {
  const [search, setSearch] = useState("");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ itemName: "", category: "", quantity: "", unitPrice: "" });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const res = await getStockSummary();
        let normalizedData = (res.data || []).map((item) => {
          const availableQty = Number(item.availableQty ?? item.remaining ?? item.totalAdded ?? 0);
          const unitPrice = Number(item.unitPrice ?? item.price ?? 0);

          return {
            itemName: item.itemName || "-",
            category: item.category || "None",
            availableQty: Number.isNaN(availableQty) ? 0 : availableQty,
            unitPrice: Number.isNaN(unitPrice) ? 0 : unitPrice,
          };
        });

        const needsFallback =
          normalizedData.length > 0 &&
          normalizedData.every((item) => (item.category === "None" || !item.category) && Number(item.unitPrice) === 0);

        const entryRes = await getStockEntries();
        const entries = Array.isArray(entryRes) ? entryRes : (entryRes?.data || []);

        if (entries.length > 0) {
          normalizedData = entries.map((entry) => ({
            _id: entry._id,
            itemName: entry.itemName || "-",
            category: entry.category || "None",
            availableQty: Number(entry.quantity) || 0,
            unitPrice: Number(entry.price) || 0,
          }));
        } else if (needsFallback || normalizedData.length === 0) {
          normalizedData = [];
        }

        setStockData(normalizedData);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || "Failed to load stock summary");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  // Filter logic
  const filteredStock = stockData.filter((item) =>
    String(item.itemName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Total stock value
  const totalStockValue = filteredStock.reduce(
    (sum, item) => sum + item.availableQty * item.unitPrice,
    0
  );

  const startEdit = (item) => {
    setEditingId(item._id || item.itemName);
    setEditForm({
      itemName: item.itemName,
      category: item.category || "None",
      quantity: String(item.availableQty ?? ""),
      unitPrice: String(item.unitPrice ?? ""),
    });
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditForm({ itemName: "", category: "", quantity: "", unitPrice: "" });
  };

  const resolveEntryId = async (row) => {
    if (row?._id || row?.id) {
      return row._id || row.id;
    }

    const entryRes = await getStockEntries();
    const entries = Array.isArray(entryRes) ? entryRes : (entryRes?.data || []);

    const exactMatch = entries.find(
      (entry) =>
        String(entry.itemName || "").trim().toLowerCase() === String(row?.itemName || "").trim().toLowerCase() &&
        Number(entry.price || 0) === Number(row?.unitPrice || 0)
    );

    if (exactMatch?._id || exactMatch?.id) {
      return exactMatch._id || exactMatch.id;
    }

    const nameMatch = entries.find(
      (entry) =>
        String(entry.itemName || "").trim().toLowerCase() === String(row?.itemName || "").trim().toLowerCase()
    );

    return nameMatch?._id || nameMatch?.id || "";
  };

  const saveEdit = async (row) => {
    try {
      const rowId = await resolveEntryId(row);
      if (!rowId) {
        setError("This row cannot be edited. Please add/edit via latest stock entries.");
        return;
      }

      const quantity = Number(editForm.quantity);
      const unitPrice = Number(editForm.unitPrice);

      if (!editForm.itemName.trim() || quantity <= 0 || unitPrice <= 0) {
        setError("Item Name, Quantity and Unit Price are required");
        return;
      }

      setError("");
      await updateStockEntry(rowId, {
        itemName: editForm.itemName.trim(),
        category: editForm.category || "None",
        quantity,
        price: unitPrice,
      });

      setStockData((prev) =>
        prev.map((item) =>
          item._id === rowId
            ? {
                ...item,
                itemName: editForm.itemName.trim(),
                category: editForm.category || "None",
                availableQty: quantity,
                unitPrice,
              }
            : item
        )
      );

      cancelEdit();
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Failed to update stock entry");
    }
  };

  const handleDelete = async (row) => {
    try {
      const rowId = row?._id || row?.id || "";

      const isConfirmed = window.confirm(`Delete stock entry for "${row.itemName}"?`);
      if (!isConfirmed) return;

      setError("");
      await deleteStockEntry(rowId, {
        itemName: row.itemName,
        category: row.category,
        unitPrice: Number(row.unitPrice || 0),
      });

      setStockData((prev) =>
        prev.filter((item) => {
          const itemId = item?._id || item?.id;

          if (itemId) {
            return itemId !== rowId;
          }

          const sameName = String(item?.itemName || "").trim().toLowerCase() === String(row?.itemName || "").trim().toLowerCase();
          const sameCategory = String(item?.category || "").trim().toLowerCase() === String(row?.category || "").trim().toLowerCase();
          const samePrice = Number(item?.unitPrice || 0) === Number(row?.unitPrice || 0);

          return !(sameName && sameCategory && samePrice);
        })
      );

      if (editingId === rowId) {
        cancelEdit();
      }
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          deleteError.message ||
          "Failed to delete stock entry"
      );
    }
  };

  const handleGenerateReport = () => {
    if (!filteredStock.length) {
      setError("No stock data available to generate report");
      return;
    }

    setError("");

    const headers = ["Item Name", "Category", "Quantity", "Unit Price", "Total"];
    const rows = filteredStock.map((item) => [
      item.itemName,
      item.category,
      Number(item.availableQty || 0),
      Number(item.unitPrice || 0),
      Number(item.availableQty || 0) * Number(item.unitPrice || 0),
    ]);

    rows.push([]);
    rows.push(["", "", "", "Total Stock Value", Number(totalStockValue || 0)]);

    const escapeCSVValue = (value) => {
      const text = String(value ?? "");
      if (text.includes('"') || text.includes(",") || text.includes("\n")) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSVValue).join(","))
      .join("\n");

    const fileDate = new Date().toISOString().slice(0, 10);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `stock-summary-report-${fileDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Stock Summary</h2>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* SEARCH + REPORT BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <input
          type="text"
          className="form-control md:w-1/3"
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-4">
          <h4 className="text-lg font-semibold">
            Total Stock Value: ₹ {totalStockValue.toLocaleString()}
          </h4>
          <button
            onClick={handleGenerateReport}
            className="btn btn-primary"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th style={{ width: "150px" }}>Quantity</th>
            <th style={{ width: "150px" }}>Unit Price</th>
            <th style={{ width: "180px" }}>Total</th>
            <th style={{ width: "160px" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                Loading stock summary...
              </td>
            </tr>
          ) : filteredStock.length > 0 ? (
            filteredStock.map((item, index) => (
              <tr key={index}>
                <td>
                  {editingId === (item._id || item.itemName) ? (
                    <input
                      className="form-control"
                      value={editForm.itemName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, itemName: e.target.value }))}
                    />
                  ) : (
                    item.itemName
                  )}
                </td>
                <td>
                  {editingId === (item._id || item.itemName) ? (
                    <select
                      className="form-control"
                      value={editForm.category}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="None">None</option>
                      <option value="IoT Products">IoT Products</option>
                      <option value="IoT Solutions">IoT Solutions</option>
                      <option value="Services">Services</option>
                    </select>
                  ) : (
                    item.category
                  )}
                </td>
                <td>
                  {editingId === (item._id || item.itemName) ? (
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    />
                  ) : (
                    item.availableQty
                  )}
                </td>
                <td>
                  {editingId === (item._id || item.itemName) ? (
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.unitPrice}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, unitPrice: e.target.value }))}
                    />
                  ) : (
                    <>₹ {Number(item.unitPrice || 0).toLocaleString()}</>
                  )}
                </td>
                <td className="fw-semibold">
                  ₹ {(Number(item.availableQty || 0) * Number(item.unitPrice || 0)).toLocaleString()}
                </td>
                <td>
                  {editingId === (item._id || item.itemName) ? (
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-success" onClick={() => saveEdit(item)}>
                        Save
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-primary" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item)}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No stock items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockSummary;
