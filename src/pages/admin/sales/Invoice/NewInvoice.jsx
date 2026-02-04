import { useState } from "react";

export default function NewInvoice() {
	const [form, setForm] = useState({
		customerName: "",
		invoiceNumber: "",
		date: "",
		dueDate: "",
		description: "",
		amount: "",
		status: "Pending",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Placeholder submit to avoid runtime errors until API wiring is added.
		console.log("New invoice submitted", form);
	};

	return (
		<div className="p-4 bg-white shadow rounded">
			<h2 className="text-2xl mb-3">Create New Invoice</h2>

			<form onSubmit={handleSubmit}>
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

				<button type="submit" className="btn btn-primary">
					Save Invoice
				</button>
			</form>
		</div>
	);
}
