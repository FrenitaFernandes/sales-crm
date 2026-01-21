import React, { useState } from "react";

const NewInvoice = () => {
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");

  const [items, setItems] = useState([
    { description: "", qty: "", unitPrice: "", total: 0 },
  ]);

  // Add new invoice item row
  const addItem = () => {
    setItems([
      ...items,
      { description: "", qty: "", unitPrice: "", total: 0 },
    ]);
  };

  // Handle input change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    const qty = parseFloat(updatedItems[index].qty) || 0;
    const price = parseFloat(updatedItems[index].unitPrice) || 0;
    updatedItems[index].total = qty * price;

    setItems(updatedItems);
  };

  // Grand total
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    const payload = {
      customerName,
      invoiceNumber,
      date,
      items,
      grandTotal,
    };

    console.log("Invoice Submitted:", payload);
    alert("Invoice created successfully! (check console)");
  };

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">New Invoice</h2>

      {/* CUSTOMER + INVOICE DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Customer Name</label>
          <input
            type="text"
            className="form-control mt-1"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Invoice Number</label>
          <input
            type="text"
            className="form-control mt-1"
            placeholder="INV-001"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Invoice Date</label>
          <input
            type="date"
            className="form-control mt-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* ITEMS TABLE */}
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Description</th>
            <th style={{ width: "120px" }}>Quantity</th>
            <th style={{ width: "150px" }}>Unit Price</th>
            <th style={{ width: "140px" }}>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Item / Service description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) =>
                    handleItemChange(index, "qty", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, "unitPrice", e.target.value)
                  }
                />
              </td>

              <td className="text-end fw-semibold">
                ₹ {item.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD ITEM */}
      <button className="btn btn-primary mt-2" onClick={addItem}>
        + Add Item
      </button>

      {/* SUBMIT + GRAND TOTAL */}
      <div className="flex justify-between items-center mt-6">
        <button className="btn btn-success" onClick={handleSubmit}>
          Create Invoice
        </button>

        <h3 className="text-xl font-semibold">
          Grand Total: ₹ {grandTotal.toFixed(2)}
        </h3>
      </div>
    </div>
  );
};

export default NewInvoice;
