import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createInvoice, getInvoiceById, updateInvoice, updateInvoiceStatus } from "../../../../services/invoiceService";

export default function NewInvoice() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const editingInvoiceId = searchParams.get("invoiceId");
	const isEditMode = useMemo(() => Boolean(editingInvoiceId), [editingInvoiceId]);
	const [form, setForm] = useState({
		customerName: "",
		invoiceNumber: "",
		date: "",
		dueDate: "",
		description: "",
		amount: "",
		status: "Pending",
	});
	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const loadInvoiceForEdit = async () => {
			if (!editingInvoiceId) return;

			setIsLoadingInvoice(true);
			setError("");

			try {
				const res = await getInvoiceById(editingInvoiceId);
				const invoice = res?.data;

				if (!invoice) {
					setError("Invoice not found");
					return;
				}

				const statusMap = {
					pending: "Pending",
					paid: "Paid",
					overdue: "Overdue",
					cancelled: "Pending",
				};

				const toInputDate = (dateValue) => {
					if (!dateValue) return "";
					const parsedDate = new Date(dateValue);
					if (Number.isNaN(parsedDate.getTime())) return "";
					return parsedDate.toISOString().split("T")[0];
				};

				setForm({
					customerName: invoice.customerName || "",
					invoiceNumber: invoice.invoiceNumber || "",
					date: toInputDate(invoice.invoiceDate),
					dueDate: toInputDate(invoice.dueDate),
					description: invoice.description || invoice.items?.[0]?.itemName || "",
					amount: String(invoice.amount ?? invoice.total ?? ""),
					status: statusMap[invoice.status] || "Pending",
				});
			} catch (loadError) {
				setError(loadError.response?.data?.message || "Failed to load invoice");
			} finally {
				setIsLoadingInvoice(false);
			}
		};

		loadInvoiceForEdit();
	}, [editingInvoiceId]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		
		// Auto-update due date when invoice date changes (30 days later)
		if (name === "date" && value) {
			const invoiceDate = new Date(value);
			const dueDate = new Date(invoiceDate);
			dueDate.setDate(dueDate.getDate() + 30);
			const formattedDueDate = dueDate.toISOString().split('T')[0];
			setForm((prev) => ({ ...prev, [name]: value, dueDate: formattedDueDate }));
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (isLoadingInvoice) return;

		setIsSaving(true);
		setMessage("");
		setError("");

		try {
			const numericAmount = Number(form.amount);
			const descriptionText = String(form.description || "").trim();
			const payload = {
				customerName: form.customerName,
				invoiceNumber: form.invoiceNumber,
				amount: form.amount,
				subtotal: numericAmount,
				total: numericAmount,
				tax: 0,
				discount: 0,
				items: descriptionText
					? [{ itemName: descriptionText, quantity: 1, price: numericAmount, total: numericAmount }]
					: [],
				date: form.date,
				invoiceDate: form.date,
				dueDate: form.dueDate,
				description: descriptionText,
			};

			const normalizedStatus = String(form.status || "Pending").toLowerCase();

			if (isEditMode && editingInvoiceId) {
				await updateInvoice(editingInvoiceId, { ...payload, status: normalizedStatus });
				setMessage("Invoice updated successfully");
			} else {
				const createRes = await createInvoice(payload);
				const createdInvoiceId = createRes?.data?._id;

				if (createdInvoiceId) {
					try {
						await updateInvoiceStatus(createdInvoiceId, normalizedStatus);
					} catch (statusUpdateError) {
						console.error("Status update failed:", statusUpdateError?.response?.data || statusUpdateError.message);
						try {
							await updateInvoice(createdInvoiceId, { status: normalizedStatus });
						} catch (fallbackUpdateError) {
							console.error("Fallback status update failed:", fallbackUpdateError?.response?.data || fallbackUpdateError.message);
							setMessage("Invoice saved, but status update failed");
						}
					}
				}

				setMessage((prev) => prev || "Invoice saved successfully");
			}

			setForm({
				customerName: "",
				invoiceNumber: "",
				date: "",
				dueDate: "",
				description: "",
				amount: "",
				status: "Pending",
			});

			setTimeout(() => {
				navigate("/admin/sales/invoice/history");
			}, 400);
		} catch (submitError) {
			setError(submitError.response?.data?.message || "Failed to save invoice");
		} finally {
			setIsSaving(false);
		}
	};

	const handleEdit = () => {
		navigate("/admin/sales/invoice/history");
	};

	return (
		<div className="p-4 bg-white shadow rounded">
			<h2 className="text-2xl mb-3">{isEditMode ? "Edit Invoice" : "Create New Invoice"}</h2>

			<form onSubmit={handleSubmit}>
				{isLoadingInvoice && <div className="alert alert-info py-2">Loading invoice details...</div>}
				{message && <div className="alert alert-success py-2">{message}</div>}
				{error && <div className="alert alert-danger py-2">{error}</div>}

				<div className="row">
					<div className="col-4 mb-3">
						<label className="form-label">Customer Name</label>
						<input
							type="text"
							name="customerName"
							className="form-control"
							value={form.customerName}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="col-4 mb-3">
						<label className="form-label">Invoice Number</label>
						<input
							type="text"
							name="invoiceNumber"
							className="form-control"
							value={form.invoiceNumber}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="col-4 mb-3">
						<label className="form-label">Amount</label>
						<input
							type="number"
							name="amount"
							className="form-control"
							value={form.amount}
							onChange={handleChange}
							min="0"
							step="0.01"
							required
						/>
					</div>
				</div>

				<div className="row">
					<div className="col-4 mb-3">
						<label className="form-label">Invoice Date</label>
						<input
							type="date"
							name="date"
							className="form-control"
							value={form.date}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="col-4 mb-3">
						<label className="form-label">Due Date</label>
						<input
							type="date"
							name="dueDate"
							className="form-control"
							value={form.dueDate}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="col-4 mb-3">
						<label className="form-label">Status</label>
						<select
							name="status"
							className="form-select"
							value={form.status}
							onChange={handleChange}
						>
							<option value="Pending">Pending</option>
							<option value="Paid">Paid</option>
							<option value="Overdue">Overdue</option>
						</select>
					</div>
				</div>

				<div className="mb-3">
					<label className="form-label">Description</label>
					<textarea
						name="description"
						className="form-control"
						rows="3"
						value={form.description}
						onChange={handleChange}
						placeholder="Notes or line item summary"
					/>
				</div>

				<div className="flex gap-3">
					<button type="submit" className="btn btn-primary" disabled={isSaving}>
						{isSaving ? "Saving..." : isEditMode ? "Update Invoice" : "Save Invoice"}
					</button>
					<button 
						type="button" 
						className="btn btn-secondary"
						onClick={handleEdit}
					>
						{isEditMode ? "Back to History" : "Edit Invoice"}
					</button>
				</div>
			</form>
		</div>
	);
}
