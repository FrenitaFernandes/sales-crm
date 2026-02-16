import React, { useState } from "react";

const StockSummary = () => {
  const [search, setSearch] = useState("");

  // Temporary static data (later connect to backend)
  const stockData = [
    {
      itemName: "Laptop",
      category: "Electronics",
      availableQty: 25,
      unitPrice: 45000,
    },
    {
      itemName: "Mouse",
      category: "Accessories",
      availableQty: 120,
      unitPrice: 500,
    },
    {
      itemName: "Keyboard",
      category: "Accessories",
      availableQty: 80,
      unitPrice: 1200,
    },
    {
      itemName: "Printer",
      category: "Electronics",
      availableQty: 10,
      unitPrice: 15000,
    },
  ];

  // Filter logic
  const filteredStock = stockData.filter((item) =>
    item.itemName.toLowerCase().includes(search.toLowerCase())
  );

  // Total stock value
  const totalStockValue = filteredStock.reduce(
    (sum, item) => sum + item.availableQty * item.unitPrice,
    0
  );

  // Generate Report Handler
  const handleGenerateReport = () => {
    console.log("Generating stock report...", filteredStock);
    alert("Stock report generated! (Check console)");
    // TODO: Implement PDF/Excel generation or navigate to report page
  };

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Stock Summary</h2>

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
            <th style={{ width: "150px" }}>Available Qty</th>
            <th style={{ width: "150px" }}>Unit Price</th>
            <th style={{ width: "180px" }}>Total Value</th>
          </tr>
        </thead>

        <tbody>
          {filteredStock.length > 0 ? (
            filteredStock.map((item, index) => (
              <tr key={index}>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td>{item.availableQty}</td>
                <td>₹ {item.unitPrice.toLocaleString()}</td>
                <td className="fw-semibold">
                  ₹ {(item.availableQty * item.unitPrice).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
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
