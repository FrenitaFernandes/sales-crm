import { useEffect, useState } from "react";
import axios from "axios";

export default function AdvertisementList() {
  const [ads, setAds] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/advertisement");
      setAds(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching advertisements:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      setStatusError("");
      setStatusMessage("");

      const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";

      try {
        await axios.delete(`http://localhost:5000/api/admin/advertisement/${id}`);
      } catch (adminErr) {
        // Fallback to existing protected ads route if admin route is not loaded yet.
        await axios.delete(`http://localhost:5000/api/ads/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      }

      setAds((prev) => prev.filter((ad) => ad._id !== id));
      setStatusMessage("Advertisement deleted successfully.");
    } catch (err) {
      console.error("Error deleting advertisement:", err);
      setStatusError("Failed to delete advertisement");
    }
  };

  return (
    <div className="container-fluid px-4">
      <h2 className="mt-4 mb-3">Advertisement List</h2>

      {statusMessage && (
        <div className="alert alert-success py-2 mb-3">{statusMessage}</div>
      )}

      {statusError && (
        <div className="alert alert-danger py-2 mb-3">{statusError}</div>
      )}

      <div className="table-responsive shadow-sm bg-white p-3 rounded">
        <table className="table table-bordered table-striped">
          <thead className="table-primary text-center">
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Target Area</th>
              <th>Target Audience</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-3">
                  No advertisements found
                </td>
              </tr>
            ) : (
              ads.map((ad, index) => (
                <tr key={ad._id}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    {ad.date
                      ? new Date(ad.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{ad.productName}</td>
                  <td>{ad.description}</td>
                  <td>{ad.targetArea}</td>
                  <td>{ad.targetAudience}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(ad._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
