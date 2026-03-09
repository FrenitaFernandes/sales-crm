import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createInvoice, getInvoiceById, updateInvoice, updateInvoiceStatus } from "../../../../services/invoiceService";
import axios from "axios";

export default function NewInvoice() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const editingInvoiceId = searchParams.get("invoiceId");
	const isEditMode = useMemo(() => Boolean(editingInvoiceId), [editingInvoiceId]);

	const [form, setForm] = useState({
		invoiceNumber: "",
		customerId: "",
		customerEmail: "",
		customerName: "",
		projectName: "",
		customerPhone: "",
		amount: "",
		date: "",
		dueDate: "",
		status: "Pending",
		description: "",
	});

	const [projectRequests, setProjectRequests] = useState([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
	const [isLoadingProjects, setIsLoadingProjects] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const addDaysToInputDate = (inputDate, days) => {
		if (!inputDate) return "";
		const base = new Date(inputDate);
		if (Number.isNaN(base.getTime())) return "";
		base.setDate(base.getDate() + days);
		return base.toISOString().split("T")[0];
	};

	const getTodayInputDate = () => new Date().toISOString().split("T")[0];

	const toInputDate = (dateValue) => {
		if (!dateValue) return "";
		const parsedDate = new Date(dateValue);
		if (Number.isNaN(parsedDate.getTime())) return "";
		return parsedDate.toISOString().split("T")[0];
	};

	const normalizeProjectRequest = (item) => {
		const customerObj = item?.customerId && typeof item.customerId === "object" ? item.customerId : null;
		return {
			id: item?._id || "",
			customerId: customerObj?._id || item?.customerId || "",
			customerEmail: item?.email || customerObj?.email || "",
			customerName: item?.customerName || customerObj?.name || item?.clientName || "",
			customerPhone: item?.phone || customerObj?.phone || "",
			projectName: item?.projectName || "",
			createdAt: item?.createdAt || item?.updatedAt || "",
		};
	};

	useEffect(() => {
		const loadInitialData = async () => {
			try {
				setIsLoadingProjects(true);
				const token = localStorage.getItem("authToken") || localStorage.getItem("token");

				const [projectRes] = await Promise.all([
					axios.get("http://localhost:5000/api/projects", {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				const requests = (projectRes.data?.data || []).map(normalizeProjectRequest);
				requests.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
				setProjectRequests(requests);

				if (!isEditMode) {
					const today = getTodayInputDate();
					setForm((prev) => ({
						...prev,
						date: prev.date || today,
						dueDate: prev.dueDate || addDaysToInputDate(today, 14),
					}));
				}
			} catch (loadError) {
				console.error("Failed to load invoice prerequisites:", loadError);
			} finally {
				setIsLoadingProjects(false);
			}
		};

		loadInitialData();
	}, [isEditMode]);

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

				setForm({
					invoiceNumber: invoice.invoiceNumber || "",
					customerId: invoice.customerId || "",
					customerEmail: invoice.customerEmail || "",
					customerName: invoice.customerName || "",
					projectName: invoice.projectName || "",
					customerPhone: invoice.customerPhone || "",
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

		if (name === "date" && value) {
			setForm((prev) => ({
				...prev,
				[name]: value,
				dueDate: addDaysToInputDate(value, 14),
			}));
			return;
		}

		if (name === "customerEmail") {
			const normalizedInput = String(value || "").trim().toLowerCase();
			const selected = projectRequests.find(
				(item) => String(item.customerEmail || "").trim().toLowerCase() === normalizedInput
			);

			if (selected) {
				setForm((prev) => ({
					...prev,
					customerEmail: String(value || "").trim(),
					customerId: selected.customerId || prev.customerId,
					customerName: selected.customerName || prev.customerName,
					projectName: selected.projectName || prev.projectName,
					customerPhone: selected.customerPhone || prev.customerPhone,
				}));
				return;
			}
		}

		setForm((prev) => ({ ...prev, [name]: value }));
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
				customerId: form.customerId || undefined,
				customerEmail: form.customerEmail,
				customerPhone: form.customerPhone,
				customerName: form.customerName,
				projectName: form.projectName,
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
						try {
							await updateInvoice(createdInvoiceId, { status: normalizedStatus });
						} catch (fallbackUpdateError) {
							console.error("Status update fallback failed:", fallbackUpdateError);
						}
					}
				}

				setMessage("Invoice saved successfully");

				setForm({
					invoiceNumber: "",
					customerId: "",
					customerEmail: "",
					customerName: "",
					projectName: "",
					customerPhone: "",
					date: getTodayInputDate(),
					dueDate: addDaysToInputDate(getTodayInputDate(), 14),
					description: "",
					amount: "",
					status: "Pending",
				});
			}

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
						<label className="form-label">Customer Email</label>
						<input
							type="text"
							name="customerEmail"
							list="invoice-customer-email-options"
							className="form-control"
							value={form.customerEmail}
							onChange={handleChange}
							required
							placeholder={isLoadingProjects ? "Loading requests..." : "Search/select customer email"}
							disabled={isLoadingProjects}
						/>
						<datalist id="invoice-customer-email-options">
							{projectRequests.map((item) => (
								<option key={item.id || `${item.customerEmail}-${item.projectName}`} value={item.customerEmail}>
									{item.customerName} - {item.projectName}
								</option>
							))}
						</datalist>
					</div>

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
				</div>

				<div className="row">
					<div className="col-4 mb-3">
						<label className="form-label">Project Name</label>
						<input
							type="text"
							name="projectName"
							className="form-control"
							value={form.projectName}
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
				</div>

				<div className="row">
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
					<button type="button" className="btn btn-secondary" onClick={handleEdit}>
						{isEditMode ? "Back to History" : "Edit Invoice"}
					</button>
				</div>
			</form>
		</div>
	);
}
