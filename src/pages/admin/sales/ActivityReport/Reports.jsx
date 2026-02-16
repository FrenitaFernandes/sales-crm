import { useMemo } from "react";

const Reports = () => {
  const summary = useMemo(
    () => [
      { label: "Leads Added", value: 42 },
      { label: "Calls Made", value: 18 },
      { label: "Emails Sent", value: 66 },
    ],
    []
  );

  const activities = useMemo(
    () => [
      {
        id: 1,
        date: "2026-02-01",
        user: "admin@rdltech.com",
        action: "Created lead",
        details: "Energy Monitoring - Northwind Traders",
      },
      {
        id: 2,
        date: "2026-02-01",
        user: "sales@rdltech.com",
        action: "Updated project",
        details: "IotSolutions - Cloud Storage Monitoring",
      },
      {
        id: 3,
        date: "2026-01-30",
        user: "admin@rdltech.com",
        action: "Sent invoice",
        details: "INV-003 to Northwind Traders",
      },
    ],
    []
  );

  return (
    <div className="container-fluid px-4">
      <h2 className="mt-4 mb-3">Activity Reports</h2>

      <div className="row g-3 mb-4">
        {summary.map((item) => (
          <div className="col-6 col-md-3" key={item.label}>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-muted small">{item.label}</div>
                <div className="h4 mb-0">{item.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-responsive shadow-sm bg-white p-3 rounded">
        <table className="table table-bordered table-striped">
          <thead className="table-primary text-center">
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((row, idx) => (
              <tr key={row.id}>
                <td className="text-center">{idx + 1}</td>
                <td>{row.date}</td>
                <td>{row.user}</td>
                <td>{row.action}</td>
                <td>{row.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
