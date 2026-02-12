import { FileText, Download, Eye } from "lucide-react";
import { useState } from "react";

function Invoices() {
  // Dummy frontend-only invoice data
  const [invoices] = useState([
    {
      invoiceId: "INV-1001",
      date: "2024-01-12",
      amount: 3499,
      status: "Paid",
    },
    {
      invoiceId: "INV-1002",
      date: "2023-12-20",
      amount: 1499,
      status: "Pending",
    },
    {
      invoiceId: "INV-1003",
      date: "2023-11-03",
      amount: 2599,
      status: "Overdue",
    },
  ]);

  return (
    <div className="p-6 space-y-6">

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <FileText /> Invoices
      </h1>

      {/* INVOICE TABLE */}
      <div className="bg-white p-6 shadow rounded-xl">

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3 text-left">Invoice ID</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv, idx) => (
              <tr
                key={idx}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">{inv.invoiceId}</td>
                <td className="p-3">{inv.date}</td>
                <td className="p-3 font-semibold text-blue-600">
                  ₹{inv.amount}
                </td>

                {/* STATUS BADGES */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        inv.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {inv.status}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-3 text-right space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 inline-flex">
                    <Eye size={16} /> View
                  </button>

                  <button className="px-3 py-1 bg-gray-200 rounded flex items-center gap-1 inline-flex">
                    <Download size={16} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Invoices;