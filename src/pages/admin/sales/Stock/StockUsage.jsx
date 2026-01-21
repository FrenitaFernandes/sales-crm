import React, { useState } from "react";

const StockUsage = () => {
  const [date, setDate] = useState("");
  const [usedBy, setUsedBy] = useState("");

  const [items, setItems] = useState([
    {
      itemName: "",
      availableQty: "",
      usedQty: "",
      remainingQty: 0,
    },
  ]);

  // Add new row
  const addItem = () => {
    setItems([
      ...items,
      { itemName: "", availableQty: "", usedQty: "", remainingQty: 0 },
    ]);
  };

  // Handle input changes
  const handleChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    const available = parseFloat(updatedItems[index].availableQty) || 0;
    const used = parseFloat(updatedItems[index].usedQty) || 0;

    updatedItems[index].remainingQty =
      available - used >= 0 ? available - used : 0;

    setItems(updatedItems);
  };

  const handleSubmit = () => {
    const payload = {
      date,
      usedBy,
      items,
    };

    console.log("Stock Usage Submitted:", payload);
    alert("Stock usage submitted! (check console)");
  };

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Stock Usage</h2>

      {/* TOP FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Usage Date</label>
          <input
            type="date"
            className="form-control mt-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Used By / Department</label>
          <input
            type="text"
            className="form-control mt-1"
            placeholder="Eg: Sales Team"
            value={usedBy}
            onChange={(e) => setUsedBy(e.target.value)}
          />
        </div>
      </div>

      {/* USAGE TABLE */}
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Item Name</th>
            <th style={{ width: "160px" }}>Available Qty</th>
            <th style={{ width: "140px" }}>Used Qty</th>
            <th style={{ width: "160px" }}>Remaining Qty</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Item name"
                  value={item.itemName}
                  onChange={(e) =>
                    handleChange(index, "itemName", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Available"
                  value={item.availableQty}
                  onChange={(e) =>
                    handleChange(index, "availableQty", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Used"
                  value={item.usedQty}
                  onChange={(e) =>
                    handleChange(index, "usedQty", e.target.value)
                  }
                />
              </td>

              <td className="text-end font-semibold">
                {item.remainingQty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD ITEM */}
      <button className="btn btn-primary mt-2" onClick={addItem}>
        + Add Item
      </button>

      {/* SUBMIT */}
      <div className="flex justify-end mt-6">
        <button className="btn btn-success" onClick={handleSubmit}>
          Submit Stock Usage
        </button>
      </div>
    </div>
  );
};

export default StockUsage;
