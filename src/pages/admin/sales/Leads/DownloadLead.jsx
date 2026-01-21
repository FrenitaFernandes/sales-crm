import { useState } from "react";
import { MdDownload, MdFilterList, MdDateRange, MdCheckCircle } from "react-icons/md";

export default function DownloadLead() {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [selectedFields, setSelectedFields] = useState({
    date: true,
    projectName: true,
    companyName: true,
    lfDetails: true,
    phoneNumber: true,
    contactPerson: true,
    email: true,
    status: true,
    updatedBy: true,
  });

  const leads = [
    {
      id: 1,
      date: "2025-05-04",
      projectName: "IotProducts - Data Logger IIoT 4.0",
      companyName: "rdl",
      lfDetails: "simple",
      phoneNumber: "4561237895, 07894561235",
      contactPerson: "TEST",
      email: "TEST@GMAIL.COM",
      status: "preranarp@gmail.com",
      updatedBy: "preranarp@gmail.com",
    },
    {
      id: 2,
      date: "2025-05-30",
      projectName: "IotSolutions - Cloud Storage Monitoring",
      companyName: "sharktank",
      lfDetails: "simple",
      phoneNumber: "7654487988, 87656689",
      contactPerson: "adithya",
      email: "adithya@gmail.com",
      status: "preranarp@gmail.com",
      updatedBy: "preranarp@gmail.com",
    },
    {
      id: 3,
      date: "2025-04-11",
      projectName: "IotSolutions - Energy Management System",
      companyName: "php tech",
      lfDetails: "simple",
      phoneNumber: "06546768709, 07894561235",
      contactPerson: "hari",
      email: "priyanka@gmail.com",
      status: "preranarp@gmail.com",
      updatedBy: "preranarp@gmail.com",
    },
  ];

  const handleFieldToggle = (field) => {
    setSelectedFields({
      ...selectedFields,
      [field]: !selectedFields[field],
    });
  };

  const handleDownload = () => {
    let content = "";
    const fileName = `leads_${new Date().toISOString().split("T")[0]}`;

    if (selectedFormat === "csv") {
      // CSV format
      const headers = Object.keys(selectedFields)
        .filter((key) => selectedFields[key])
        .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
        .join(",");
      content = headers + "\n";

      leads.forEach((lead) => {
        const row = Object.keys(selectedFields)
          .filter((key) => selectedFields[key])
          .map((key) => `"${lead[key]}"`)
          .join(",");
        content += row + "\n";
      });
    } else if (selectedFormat === "json") {
      // JSON format
      const filteredLeads = leads.map((lead) => {
        const filtered = {};
        Object.keys(selectedFields).forEach((key) => {
          if (selectedFields[key]) {
            filtered[key] = lead[key];
          }
        });
        return filtered;
      });
      content = JSON.stringify(filteredLeads, null, 2);
    } else if (selectedFormat === "txt") {
      // Text format
      leads.forEach((lead) => {
        Object.keys(selectedFields).forEach((key) => {
          if (selectedFields[key]) {
            content += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${lead[key]}\n`;
          }
        });
        content += "\n---\n\n";
      });
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Download Leads</h2>
        <p className="text-gray-600">Export your leads data in various formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Settings</h3>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">File Format</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={selectedFormat === "csv"}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">CSV (.csv)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={selectedFormat === "json"}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">JSON (.json)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="txt"
                    checked={selectedFormat === "txt"}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Text (.txt)</span>
                </label>
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MdDateRange className="inline mr-1" />
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              <MdDownload size={20} />
              Download Leads
            </button>
          </div>
        </div>

        {/* Field Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Fields to Export</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(selectedFields).map((field) => (
                <label key={field} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFields[field]}
                    onChange={() => handleFieldToggle(field)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                  </span>
                  {selectedFields[field] && (
                    <MdCheckCircle className="text-blue-600" size={18} />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    {Object.keys(selectedFields)
                      .filter((key) => selectedFields[key])
                      .map((field) => (
                        <th key={field} className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 3).map((lead, index) => (
                    <tr key={lead.id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      {Object.keys(selectedFields)
                        .filter((key) => selectedFields[key])
                        .map((field) => (
                          <td key={field} className="px-3 py-2 text-xs text-gray-700">
                            {lead[field]}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">Showing preview of {leads.length} total leads</p>
          </div>
        </div>
      </div>
    </div>
  );
}
