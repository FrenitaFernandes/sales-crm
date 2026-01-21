import React, { useState } from "react";

const InvoiceHistory = () => {
  // Sample invoice list (you can replace with API data later)
  const [invoices] = useState([
    {
      id: "INV-001",
      customer: "John Doe",
      date: "2024-12-01",
      amount: 2500,
      status: "Paid",
    },
    {
      id: "INV-002",
      customer: "Sarah Smith",
      date: "2024-12-05",
      amount: 1800,
      status: "Pending",
    },
    {
      id: "INV-003",
      customer: "Michael Brown",
      date: "2024-12-10",
      amount: 3200,
      status: "Paid",
    },
  ]);

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Invoice History</h2>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="table table-bordered w-100">
          <thead className="bg-light">
            <tr>
              <th>Invoice No</th>
              <th>Customer Name</th>
              <th>Date</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.customer}</td>
                <td>{inv.date}</td>
                <td>₹ {inv.amount.toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      inv.status === "Paid"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary me-2">
                    View
                  </button>
                  <button className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceHistory;
