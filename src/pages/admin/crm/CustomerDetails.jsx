import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, customer: null });
  const [alertModal, setAlertModal] = useState({ open: false, message: "", isError: false });

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

  const isDeletedCustomer = (customer) => {
    const status = String(customer?.status || "").trim().toLowerCase();
    return Boolean(customer?.isDeleted) || status === "deleted";
  };

  const activeInactiveCustomers = filteredCustomers.filter(
    (customer) => !isDeletedCustomer(customer)
  );

  const deletedCustomers = filteredCustomers.filter((customer) =>
    isDeletedCustomer(customer)
  );

  const handlePermanentDeleteCustomer = (customer) => {
    setConfirmModal({ open: true, customer });
  };

  const confirmPermanentDelete = async () => {
    const customer = confirmModal.customer;
    setConfirmModal({ open: false, customer: null });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/customers/${customer._id}/permanent`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to permanently delete account");
      }

      setAlertModal({ open: true, message: "Account has been permanently deleted.", isError: false });
      fetchCustomers();
    } catch (error) {
      console.log("Permanent delete error:", error);
      setAlertModal({ open: true, message: error.message || "Unable to delete account.", isError: true });
    }
  };

  const renderTable = (rows, emptyMessage, allowPermanentDelete = false) => (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Phone</th>
            <th className="p-3 border">Status</th>
            {allowPermanentDelete && <th className="p-3 border">Deleted On</th>}
            <th className="p-3 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((c) => (
              <tr key={c._id}>
                <td className="p-3 border">{c.name}</td>
                <td className="p-3 border">{c.email}</td>
                <td className="p-3 border">{c.phone}</td>
                <td className="p-3 border">{c.status}</td>
                {allowPermanentDelete && (
                  <td className="p-3 border text-sm text-gray-600">
                    {c.deletedAt
                      ? new Date(c.deletedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : c.updatedAt
                      ? new Date(c.updatedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                )}
                <td className="p-3 border flex gap-3 items-center">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => handleViewCustomer(c)}>
                    View
                  </button>

                  {allowPermanentDelete && c?.canPermanentDelete ? (
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handlePermanentDeleteCustomer(c)}>
                      <FaTrash />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={allowPermanentDelete ? 6 : 5} className="p-4 text-center">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

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

      <h3 className="text-lg font-semibold mb-2">Active / Inactive Accounts</h3>
      {renderTable(activeInactiveCustomers, "No active or inactive accounts found.")}

      <h3 className="text-lg font-semibold mt-6 mb-2">Deleted Accounts</h3>
      {renderTable(deletedCustomers, "No deleted accounts found.", true)}

      {/* Confirm Delete Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] max-w-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-red-600">{confirmModal.customer?.name || "this account"}</span>?{" "}
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setConfirmModal({ open: false, customer: null })}>
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={confirmPermanentDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.open && (
        <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] max-w-lg">
            <h3 className={`text-lg font-semibold mb-2 ${alertModal.isError ? "text-red-600" : "text-green-600"}`}>
              {alertModal.isError ? "Error" : "Success"}
            </h3>
            <p className="text-gray-700 mb-6">{alertModal.message}</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setAlertModal({ open: false, message: "", isError: false })}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-[90%] max-w-2xl shadow-2xl">
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
