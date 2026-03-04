import React, { useEffect, useState } from "react";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ✅ Fetch customers list
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/customers");
      const data = await res.json();
      // Normalize server response to an array.
      // Some endpoints may return { customers: [...] } or a single object.
      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (data && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      } else if (data && typeof data === "object") {
        // if it's a single customer object, wrap it
        setCustomers([data]);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.log("Customer fetch error:", error);
    }
  };

  // ✅ Filter customers
  const list = Array.isArray(customers) ? customers : [];

  const filteredCustomers = list.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>

      {/* ✅ Search */}
      <input
        type="text"
        placeholder="Search by name, email or phone..."
        className="border p-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ✅ Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <tr key={c._id}>
                  <td className="p-3 border">{c.name}</td>
                  <td className="p-3 border">{c.email}</td>
                  <td className="p-3 border">{c.phone}</td>
                  <td className="p-3 border">{c.status}</td>
                  <td className="p-3 border">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Customer Popup */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3">Customer Info</h3>

            <p><b>Name:</b> {selectedCustomer.name}</p>
            <p><b>Email:</b> {selectedCustomer.email}</p>
            <p><b>Phone:</b> {selectedCustomer.phone}</p>
            <p><b>Status:</b> {selectedCustomer.status}</p>

            <button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => setSelectedCustomer(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
