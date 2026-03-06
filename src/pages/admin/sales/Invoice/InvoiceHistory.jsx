import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvoices } from "../../../../services/invoiceService";

const InvoiceHistory = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const res = await getInvoices();
        setInvoices(res.data || []);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toISOString().split("T")[0];
  };

  const formatStatus = (value) => {
    if (!value) return "Pending";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  return (
    <div className="container-fluid px-4">
      <h2 className="mt-4 mb-3">Invoice History</h2>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="table-responsive shadow-sm bg-white p-3 rounded">
        <table className="table table-bordered table-striped">
          <thead className="table-primary text-center">
            <tr>
              <th>#</th>
              <th>Customer Name</th>
              <th>Invoice Number</th>
              <th>Amount</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="text-center" colSpan={9}>Loading invoices...</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td className="text-center" colSpan={9}>No invoices found</td>
              </tr>
            ) : (
              invoices.map((inv, idx) => {
                const status = formatStatus(inv.status);
                const amount = Number(inv.amount ?? inv.total ?? 0);
                const description = String(
                  inv.description || inv.items?.[0]?.itemName || "-"
                ).trim() || "-";

                return (
                  <tr key={inv._id || inv.invoiceNumber || idx}>
                    <td className="text-center">{idx + 1}</td>
                    <td>{inv.customerName}</td>
                    <td>{inv.invoiceNumber}</td>
                    <td>₹{amount.toLocaleString()}</td>
                    <td>{formatDate(inv.invoiceDate)}</td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td>
                      <span
                        className={`badge ${
                          status === "Paid"
                            ? "bg-success"
                            : status === "Overdue"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>{description}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/admin/sales/invoice/new?invoiceId=${inv._id}`)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceHistory;
