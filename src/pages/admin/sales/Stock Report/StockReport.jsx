import { useEffect, useState } from "react";
import axios from "axios";

export default function StockReport() {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch stock summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/stock/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("Stock summary error:", err);
      }
      setLoading(false);
    };
    fetchSummary();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Stock Report</h2>

      {loading ? (
        <p className="text-gray-500">Loading stock summary...</p>
      ) : Object.keys(summary).length === 0 ? (
        <p className="text-gray-500">No stock activity found.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Item Name</th>
              <th className="text-center">Remaining Qty</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary).map(([itemName, qty]) => (
              <tr key={itemName}>
                <td>{itemName}</td>
                <td className="text-center">{qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
