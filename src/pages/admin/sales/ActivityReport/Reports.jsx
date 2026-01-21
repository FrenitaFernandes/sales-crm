import React from "react";

const ActivityMainReport = () => {
  const activities = [
    {
      date: "2024-12-01",
      activity: "Stock Entry Added",
      user: "Admin",
      status: "Completed",
    },
    {
      date: "2024-12-03",
      activity: "Invoice Generated",
      user: "Admin",
      status: "Processed",
    },
    {
      date: "2024-12-05",
      activity: "Project Updated",
      user: "Manager",
      status: "Pending",
    },
  ];

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">Activity Report</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Activity</th>
              <th className="border p-2 text-left">User</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.date}</td>
                <td className="border p-2">{item.activity}</td>
                <td className="border p-2">{item.user}</td>
                <td
                  className={`border p-2 font-medium ${
                    item.status === "Completed"
                      ? "text-green-600"
                      : item.status === "Processed"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityMainReport;
