import { FileText, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { getInvoicesByCustomer } from "../../services/invoiceService";
import jsPDF from "jspdf";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [activeInvoiceLabel, setActiveInvoiceLabel] = useState("");

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

  const buildInvoicePdfBlob = (invoice) => {
    const doc = new jsPDF();
    const amount = Number(invoice?.amount || 0);
    const amountText = amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const status = String(invoice?.status || "").toUpperCase() || "PENDING";
    const description = String(invoice?.description || "").trim() || "Invoice item";

    // Header strip
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("INVOICE", 14, 14);
    doc.setFontSize(10);
    doc.text("RDL Technologies Pvt Ltd", 14, 22);
    doc.text("support@rdltech.in", 14, 28);

    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice?.invoiceNumber || "-"}`, 140, 14);
    doc.text(`Invoice Date: ${formatDate(invoice?.invoiceDate)}`, 140, 20);
    doc.text(`Due Date: ${formatDate(invoice?.dueDate)}`, 140, 26);

    // Reset color for body
    doc.setTextColor(20, 20, 20);

    // Bill-to + meta boxes
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, 42, 110, 38);
    doc.rect(130, 42, 66, 38);

    doc.setFontSize(11);
    doc.text("Bill To", 18, 49);
    doc.setFontSize(10);
    doc.text(`${invoice?.customerName || "-"}`, 18, 57);
    doc.text(`${invoice?.customerEmail || "-"}`, 18, 63);
    doc.text(`Project: ${invoice?.projectName || "-"}`, 18, 69);

    doc.setFontSize(11);
    doc.text("Invoice Info", 134, 49);
    doc.setFontSize(10);
    doc.text(`Status: ${status}`, 134, 57);
    doc.text(`Currency: INR`, 134, 63);
    doc.text(`Prepared For: Customer`, 134, 69);

    // Item table header
    doc.setFillColor(243, 244, 246);
    doc.rect(14, 88, 182, 10, "F");
    doc.rect(14, 88, 182, 26);
    doc.line(130, 88, 130, 114);
    doc.line(160, 88, 160, 114);

    doc.setFontSize(10);
    doc.text("Description", 18, 95);
    doc.text("Qty", 136, 95);
    doc.text("Amount (INR)", 165, 95);

    const descLines = doc.splitTextToSize(description, 108);
    doc.text(descLines, 18, 103);
    doc.text("1", 138, 103);
    doc.text(amountText, 165, 103);

    // Totals box
    doc.rect(130, 120, 66, 30);
    doc.text("Subtotal", 134, 128);
    doc.text(amountText, 166, 128, { align: "right" });
    doc.text("Tax", 134, 136);
    doc.text("0.00", 166, 136, { align: "right" });
    doc.setFontSize(11);
    doc.text("Total", 134, 146);
    doc.text(amountText, 166, 146, { align: "right" });

    // Footer note
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("Thank you for your business.", 14, 164);
    doc.text("This is a system generated invoice.", 14, 170);

    return doc.output("blob");
  };

  const handleView = (invoice) => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    const blob = buildInvoicePdfBlob(invoice);
    const url = URL.createObjectURL(blob);
    setPdfPreviewUrl(url);
    setActiveInvoiceLabel(invoice?.invoiceNumber || "Invoice");
  };

  const handleDownload = (invoice) => {
    const blob = buildInvoicePdfBlob(invoice);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Invoice-${invoice?.invoiceNumber || "document"}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const closePreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfPreviewUrl("");
    setActiveInvoiceLabel("");
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
                <th className="p-3 text-left">Project Name</th>
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
                  <td className="p-3">{inv.projectName || "-"}</td>
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

      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Invoice Preview - {activeInvoiceLabel}</h3>
              <button
                type="button"
                className="px-3 py-1 bg-gray-200 rounded text-sm"
                onClick={closePreview}
              >
                Close
              </button>
            </div>
            <iframe
              title="Invoice PDF Preview"
              src={pdfPreviewUrl}
              className="w-full h-[calc(85vh-52px)]"
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default Invoices;