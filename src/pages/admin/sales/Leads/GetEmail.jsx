import { useState } from "react";
import { MdEmail, MdSearch, MdDownload, MdFilterList } from "react-icons/md";

export default function GetEmail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [emails, setEmails] = useState([
    {
      id: 1,
      companyName: "rdl",
      contactPerson: "TEST",
      email: "TEST@GMAIL.COM",
      projectName: "IotProducts - Data Logger IIoT 4.0",
      dateAdded: "2025-05-04",
      status: "Active",
    },
    {
      id: 2,
      companyName: "sharktank",
      contactPerson: "adithya",
      email: "adithya@gmail.com",
      projectName: "IotSolutions - Cloud Storage Monitoring",
      dateAdded: "2025-05-30",
      status: "Active",
    },
    {
      id: 3,
      companyName: "php tech",
      contactPerson: "hari",
      email: "priyanka@gmail.com",
      projectName: "IotSolutions - Energy Management System",
      dateAdded: "2025-04-11",
      status: "Active",
    },
  ]);

  const filteredEmails = emails.filter(
    (item) =>
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportEmails = () => {
    const emailList = filteredEmails.map((item) => item.email).join(", ");
    const blob = new Blob([emailList], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead-emails.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Email Addresses</h2>
        <p className="text-gray-600">Extract and manage email addresses from your leads</p>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by email, company, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
              <MdFilterList size={18} />
              Filter
            </button>
            <button
              onClick={handleExportEmails}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <MdDownload size={18} />
              Export Emails
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <MdEmail className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Emails</p>
              <p className="text-2xl font-bold text-gray-800">{emails.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <MdEmail className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-2xl font-bold text-gray-800">
                {emails.filter((e) => e.status === "Active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <MdEmail className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-800">{filteredEmails.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email List Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact Person</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email Address</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Project Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date Added</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmails.map((item, index) => (
              <tr key={item.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-4 py-3 text-sm text-gray-700">{item.companyName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.contactPerson}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MdEmail className="text-blue-600" size={16} />
                    <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline">
                      {item.email}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.projectName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.dateAdded}</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-semibold">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEmails.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MdEmail className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-600">No emails found matching your search criteria</p>
        </div>
      )}
    </div>
  );
}
