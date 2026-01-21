import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdPhone, MdEmail } from "react-icons/md";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock lead data - replace with actual API call
  const [lead] = useState({
    id: 1,
    date: "2025-05-04T18:30:00.000Z",
    project: "IotSolutions - Water Balancing System",
    company: "JS",
    description: "Testing",
    contactPerson: "TESTing",
    email: "TEST@GMAIL.COM",
    phone: "4561237895",
    currentStatus: "converted",
  });

  const [followUpData, setFollowUpData] = useState({
    note: "",
    secondNote: "",
    followUpDate: "",
    status: "",
  });

  const [followUpHistory, setFollowUpHistory] = useState([
    {
      id: 1,
      date: "06-05-2025",
      status: "done",
      note: "processing",
      updatedBy: "preranarp@gmail.com",
    },
  ]);

  const handleInputChange = (e) => {
    setFollowUpData({
      ...followUpData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitFollowUp = (e) => {
    e.preventDefault();
    const newFollowUp = {
      id: followUpHistory.length + 1,
      date: new Date().toLocaleDateString("en-GB"),
      status: followUpData.status,
      note: followUpData.note,
      updatedBy: "current-user@gmail.com",
    };
    setFollowUpHistory([newFollowUp, ...followUpHistory]);
    setFollowUpData({
      note: "",
      secondNote: "",
      followUpDate: "",
      status: "",
    });
  };

  const handleStatusUpdate = (status) => {
    alert(`Lead marked as ${status}`);
    // Add actual status update logic here
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/sales/leads")}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <MdArrowBack size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Lead Details</h2>
      </div>

      {/* Lead Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 font-semibold">Date:</span>
            <span className="ml-2 text-gray-800">{new Date(lead.date).toLocaleString("en-IN")}</span>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Project:</span>
            <span className="ml-2 text-gray-800">{lead.project}</span>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Company:</span>
            <span className="ml-2 text-gray-800">{lead.company}</span>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Description:</span>
            <span className="ml-2 text-gray-800">{lead.description}</span>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Contact Person:</span>
            <span className="ml-2 text-gray-800">{lead.contactPerson}</span>
          </div>
          <div className="flex items-center">
            <MdEmail className="text-gray-600 mr-2" size={16} />
            <span className="text-gray-600 font-semibold">Email:</span>
            <a href={`mailto:${lead.email}`} className="ml-2 text-blue-600 hover:underline">
              {lead.email}
            </a>
          </div>
          <div className="flex items-center">
            <MdPhone className="text-gray-600 mr-2" size={16} />
            <span className="text-gray-600 font-semibold">Phone:</span>
            <a href={`tel:${lead.phone}`} className="ml-2 text-blue-600 hover:underline">
              {lead.phone}
            </a>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Current Status:</span>
            <span className="ml-2 text-gray-800 capitalize">{lead.currentStatus}</span>
          </div>
        </div>
      </div>

      {/* Follow-Up Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmitFollowUp}>
          <div className="space-y-4">
            {/* Note Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
              <textarea
                name="note"
                value={followUpData.note}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter note"
              />
            </div>

            {/* Second Note Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
              <textarea
                name="secondNote"
                value={followUpData.secondNote}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter additional note"
              />
            </div>

            {/* Follow-Up Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Follow-Up Date</label>
              <input
                type="date"
                name="followUpDate"
                value={followUpData.followUpDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={followUpData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select status</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Converted">Converted</option>
                <option value="Dropout">Dropout</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              SUBMIT FOLLOW-UP
            </button>
          </div>
        </form>
      </div>

      {/* Update Conversion Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Conversion Status</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusUpdate("Converted")}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold"
          >
            MARK AS CONVERTED
          </button>
          <button
            onClick={() => handleStatusUpdate("Interested")}
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors font-semibold"
          >
            MARK AS INTERESTED
          </button>
          <button
            onClick={() => handleStatusUpdate("Not Interested")}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold"
          >
            MARK AS NOT INTERESTED
          </button>
          <button
            onClick={() => handleStatusUpdate("Dropout")}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors font-semibold"
          >
            MARK AS DROPOUT
          </button>
        </div>
      </div>

      {/* Follow-Up History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Follow-Up History</h3>
        <div className="space-y-4">
          {followUpHistory.map((history) => (
            <div key={history.id} className="border-l-4 border-blue-600 pl-4 py-2 bg-gray-50">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Date:</span> {history.date}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Status:</span> {history.status}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Note:</span> {history.note}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Updated By:</span> {history.updatedBy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
