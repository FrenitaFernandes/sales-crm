import React, { useState } from "react";

const StockEntry = () => {
  const [supplierName, setSupplierName] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");

  const [items, setItems] = useState([
    { itemName: "", qty: "", unitPrice: "", total: 0 },
  ]);

  // Add new row
  const addItem = () => {
    setItems([...items, { itemName: "", qty: "", unitPrice: "", total: 0 }]);
  };

  // Update row values
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // Auto calculate total for each row
    const qty = parseFloat(updatedItems[index].qty) || 0;
    const price = parseFloat(updatedItems[index].unitPrice) || 0;
    updatedItems[index].total = qty * price;

    setItems(updatedItems);
  };

  // Calculate grand total
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    const payload = {
      supplierName,
      billNumber,
      date,
      category,
      items,
      grandTotal,
    };

    console.log("Submitting Stock Entry:", payload);
    alert("Stock entry submitted! (Check console)");
  };

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Stock Entry</h2>

      {/* Supplier + Bill + Date + Category */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Supplier Name</label>
          <input
            type="text"
            className="form-control mt-1"
            placeholder="Enter supplier name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Bill Number</label>
          <input
            type="text"
            className="form-control mt-1"
            placeholder="Enter bill number"
            value={billNumber}
            onChange={(e) => setBillNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            className="form-control mt-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            className="form-control mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">None</option>
            <option value="IoT Products">IoT Products</option>
            <option value="IoT Solutions">IoT Solutions</option>
            <option value="Services">Services</option>
          </select>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Item Name</th>
            <th style={{ width: "120px" }}>Quantity</th>
            <th style={{ width: "150px" }}>Unit Price</th>
            <th style={{ width: "120px" }}>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              {/* Item Name */}
              <td>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Item name"
                  value={item.itemName}
                  onChange={(e) =>
                    handleItemChange(index, "itemName", e.target.value)
                  }
                />
              </td>

              {/* Quantity */}
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

              {/* Unit Price */}
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

              {/* Total */}
              <td className="text-end">₹ {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Item Button */}
      <button className="btn btn-primary mt-2" onClick={addItem}>
        + Add Item
      </button>

      {/* Submit Button + Grand Total */}
      <div className="flex justify-between items-center mt-6">
        <button className="btn btn-success" onClick={handleSubmit}>
          Submit Stock Entry
        </button>

        <h3 className="text-xl font-semibold">
          Grand Total: ₹ {grandTotal.toFixed(2)}
        </h3>
      </div>
    </div>
  );
};

export default StockEntry;
