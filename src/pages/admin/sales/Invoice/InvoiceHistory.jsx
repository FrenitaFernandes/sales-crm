import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvoices } from "../../../../services/invoiceService";
import jsPDF from "jspdf";
import axios from "axios";

const InvoiceHistory = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [activeInvoiceLabel, setActiveInvoiceLabel] = useState("");
  const [projectNameByEmail, setProjectNameByEmail] = useState({});
  const [projectNameByCustomerId, setProjectNameByCustomerId] = useState({});

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
        const [res, projectRes] = await Promise.all([
          getInvoices(),
          axios.get("http://localhost:5000/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const projects = projectRes.data?.data || [];
        const emailLookup = {};
        const customerLookup = {};

        projects.forEach((project) => {
          const projectName = String(project?.projectName || "").trim();
          if (!projectName) return;

          const emailKey = String(project?.email || project?.customerId?.email || "").trim().toLowerCase();
          const customerIdKey = String(project?.customerId?._id || project?.customerId || "").trim();

          if (emailKey && !emailLookup[emailKey]) emailLookup[emailKey] = projectName;
          if (customerIdKey && !customerLookup[customerIdKey]) customerLookup[customerIdKey] = projectName;
        });

        setProjectNameByEmail(emailLookup);
        setProjectNameByCustomerId(customerLookup);
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

  const resolveInvoiceProjectName = (invoice) => {
    const explicitProject = String(invoice?.projectName || "").trim();
    if (explicitProject) return explicitProject;

    const emailKey = String(invoice?.customerEmail || "").trim().toLowerCase();
    if (emailKey && projectNameByEmail[emailKey]) return projectNameByEmail[emailKey];

    const customerIdKey = String(invoice?.customerId?._id || invoice?.customerId || "").trim();
    if (customerIdKey && projectNameByCustomerId[customerIdKey]) return projectNameByCustomerId[customerIdKey];

    return "-";
  };

  const buildInvoicePdfBlob = (invoice) => {
    const doc = new jsPDF();
    const amount = Number(invoice?.amount || 0);
    const amountText = amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const status = String(invoice?.status || "").toUpperCase() || "PENDING";
    const description = String(invoice?.description || "").trim() || "Invoice item";
    const projectName = resolveInvoiceProjectName(invoice);

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("INVOICE", 14, 14);
    doc.setFontSize(10);
    doc.text("RDL Technologies Pvt Ltd", 14, 22);
    doc.text("support@rdltech.in", 14, 28);

    doc.text(`Invoice #: ${invoice?.invoiceNumber || "-"}`, 140, 14);
    doc.text(`Invoice Date: ${formatDate(invoice?.invoiceDate)}`, 140, 20);
    doc.text(`Due Date: ${formatDate(invoice?.dueDate)}`, 140, 26);

    doc.setTextColor(20, 20, 20);
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, 42, 110, 38);
    doc.rect(130, 42, 66, 38);

    doc.setFontSize(11);
    doc.text("Bill To", 18, 49);
    doc.setFontSize(10);
    doc.text(`${invoice?.customerName || "-"}`, 18, 57);
    doc.text(`${invoice?.customerEmail || "-"}`, 18, 63);
    doc.text(`Project: ${projectName}`, 18, 69);

    doc.setFontSize(11);
    doc.text("Invoice Info", 134, 49);
    doc.setFontSize(10);
    doc.text(`Status: ${status}`, 134, 57);
    doc.text("Currency: INR", 134, 63);

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

    doc.rect(130, 120, 66, 30);
    doc.text("Subtotal", 134, 128);
    doc.text(amountText, 166, 128, { align: "right" });
    doc.text("Tax", 134, 136);
    doc.text("0.00", 166, 136, { align: "right" });
    doc.setFontSize(11);
    doc.text("Total", 134, 146);
    doc.text(amountText, 166, 146, { align: "right" });

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
                      <div className="d-flex gap-2 justify-content-center flex-wrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleView(inv)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleDownload(inv)}
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/admin/sales/invoice/new?invoiceId=${inv._id}`)}
                      >
                        Edit
                      </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
};

export default InvoiceHistory;
