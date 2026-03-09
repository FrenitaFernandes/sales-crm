import { FileText, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { getInvoicesByCustomer } from "../../services/invoiceService";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState(null);

  // Fetch customer profile to get customerId
  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/customers/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.data && response.data.data._id) {
          setCustomerId(response.data.data._id);
        }
      } catch (err) {
        console.error("Failed to fetch customer profile:", err);
        setError("Failed to load customer profile");
      }
    };
    fetchCustomerProfile();
  }, []);

  // Fetch invoices when customerId is available
  useEffect(() => {
    if (!customerId) return;

    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getInvoicesByCustomer(customerId);
        if (response.data) {
          setInvoices(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
        setError("Failed to load invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [customerId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status) => {
    const statusLower = String(status).toLowerCase();
    if (statusLower === "paid") {
      return "bg-green-100 text-green-700";
    } else if (statusLower === "pending") {
      return "bg-yellow-100 text-yellow-700";
    } else if (statusLower === "overdue") {
      return "bg-red-100 text-red-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const handleView = (invoice) => {
    // You can add a modal or detailed view here
    console.log("Viewing invoice:", invoice);
  };

  const handleDownload = (invoice) => {
    // You can add PDF generation here
    console.log("Downloading invoice:", invoice);
  };

  return (
    <div className="p-6 space-y-6">

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <FileText /> Invoices
      </h1>

      {/* INVOICE TABLE */}
      <div className="bg-white p-6 shadow rounded-xl">
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        
        {isLoading && <div className="alert alert-info">Loading invoices...</div>}

        {!isLoading && invoices.length === 0 && (
          <div className="alert alert-info">No invoices found.</div>
        )}

        {!isLoading && invoices.length > 0 && (
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
                  <td className="p-3">{inv.invoiceNumber}</td>
                  <td className="p-3">{formatDate(inv.invoiceDate)}</td>
                  <td className="p-3 font-semibold text-blue-600">
                    ₹{inv.amount}
                  </td>

                  {/* STATUS BADGES */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inv.status)}`}
                    >
                      {String(inv.status).charAt(0).toUpperCase() + String(inv.status).slice(1)}
                    </span>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="p-3 text-right space-x-2">
                    <button 
                      onClick={() => handleView(inv)}
                      className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 inline-flex"
                    >
                      <Eye size={16} /> View
                    </button>

                    <button 
                      onClick={() => handleDownload(inv)}
                      className="px-3 py-1 bg-gray-200 rounded flex items-center gap-1 inline-flex"
                    >
                      <Download size={16} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

    </div>
  );
}

export default Invoices;