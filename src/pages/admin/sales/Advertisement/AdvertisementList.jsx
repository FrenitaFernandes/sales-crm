import { useEffect, useState } from "react";
import axios from "axios";

function resolveAdImageSrc(rawValue) {
  const raw = String(rawValue || "").trim();

  if (!raw) return "";
  if (raw.startsWith("data:image/")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads/")) return `http://localhost:5000${raw}`;
  if (raw.startsWith("uploads/")) return `http://localhost:5000/${raw}`;

  return `http://localhost:5000/${raw}`;
}

export default function AdvertisementList() {
  const [ads, setAds] = useState([]);

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

  return (
    <div className="container-fluid px-4">
      <h2 className="mt-4 mb-3">Advertisement List</h2>

      <div className="table-responsive shadow-sm bg-white p-3 rounded">
        <table className="table table-bordered table-striped">
          <thead className="table-primary text-center">
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Product Name</th>
              <th>Tagline</th>
              <th>Description</th>
              <th>Type</th>
              <th>Target Area</th>
              <th>Target Audience</th>
              <th>Product Image</th>
            </tr>
          </thead>

          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-3">
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
                  <td>{ad.tagline}</td>
                  <td>{ad.description}</td>
                  <td>{ad.type}</td>
                  <td>{ad.targetArea}</td>
                  <td>{ad.targetAudience}</td>
                  <td className="text-center">
                    {resolveAdImageSrc(ad.thumbnail) ? (
                      <img
                        src={resolveAdImageSrc(ad.thumbnail)}
                        alt="thumb"
                        width={50}
                        height={50}
                        style={{ objectFit: "cover", borderRadius: "5px" }}
                      />
                    ) : (
                      "No image"
                    )}
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
