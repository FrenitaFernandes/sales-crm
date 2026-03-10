import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.log("Customer fetch error:", error);
    }
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      const projectList = Array.isArray(data.data) ? data.data : [];

      const customerProjects = projectList.filter((p) => {
        const projectCustomerId =
          typeof p.customerId === "object" ? p.customerId?._id : p.customerId;
        const projectCustomerEmail = String(
          typeof p.customerId === "object" ? p.customerId?.email : p.email || ""
        ).toLowerCase();
        const projectCustomerName = String(
          typeof p.customerId === "object"
            ? p.customerId?.name
            : p.customerName || ""
        ).toLowerCase();

        return (
          String(projectCustomerId || "") === String(customer._id || "") ||
          projectCustomerEmail === String(customer.email || "").toLowerCase() ||
          projectCustomerName === String(customer.name || "").toLowerCase()
        );
      });

      setProjects(customerProjects);
    } catch (error) {
      console.log("Project fetch error:", error);
      setProjects([]);
    }
  };

  const list = Array.isArray(customers) ? customers : [];

  const filteredCustomers = list.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search)
  );

  const handleDeleteCustomer = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/customers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchCustomers(); // refresh table
  } catch (error) {
    console.log("Delete error:", error);
  }
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>

      <input
        type="text"
        placeholder="Search by name, email or phone..."
        className="border p-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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
                  <td className="p-3 border flex gap-3 items-center">
    <button
      className="bg-blue-600 text-white px-3 py-1 rounded"
      onClick={() => handleViewCustomer(c)}>
      View
    </button>

    <button
      className="text-red-600 hover:text-red-800"
      onClick={() => handleDeleteCustomer(c._id)}>
      <FaTrash />
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

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3">Projects</h3>

            {projects.length > 0 ? (
              projects.map((p) => (
                <div key={p._id} className="border p-2 rounded mt-2">
                  <p><b>Project:</b> {p.projectName || "-"}</p>
                  <p><b>Status:</b> {p.status || "-"}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 mt-2">No projects assigned</p>
            )}

            <button
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setSelectedCustomer(null);
                setProjects([]);
              }}
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
