import { useMemo } from "react";

const InvoiceHistory = () => {
  const invoices = useMemo(
    () => [
      {
        id: "INV-001",
        customer: "Acme Corp",
        date: "2025-12-10",
        amount: 1250,
        status: "Paid",
      },
      {
        id: "INV-002",
        customer: "Brighton LLC",
        date: "2026-01-05",
        amount: 980,
        status: "Pending",
      },
      {
        id: "INV-003",
        customer: "Northwind Traders",
        date: "2026-01-28",
        amount: 2100,
        status: "Overdue",
      },
    ],
    []
  );

  return (
    <div className="container-fluid px-4">
      <h2 className="mt-4 mb-3">Invoice History</h2>

      <div className="table-responsive shadow-sm bg-white p-3 rounded">
        <table className="table table-bordered table-striped">
          <thead className="table-primary text-center">
            <tr>
              <th>#</th>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr key={inv.id}>
                <td className="text-center">{idx + 1}</td>
                <td>{inv.id}</td>
                <td>{inv.customer}</td>
                <td>{inv.date}</td>
                <td>₹{inv.amount.toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      inv.status === "Paid"
                        ? "bg-success"
                        : inv.status === "Overdue"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                    }`}
                  >
                    {inv.status}
                  </span>
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
