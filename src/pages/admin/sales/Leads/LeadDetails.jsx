import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdPhone, MdEmail, MdRefresh } from "react-icons/md";
import { getLeadById, addFollowUp, updateLeadStatus } from "../../../../services/leadService";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [followUpData, setFollowUpData] = useState({
    note: "",
    secondNote: "",
    followUpDate: "",
    status: "",
  });

  // Fetch lead data on component mount
  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const response = await getLeadById(id);
      console.log("Lead data fetched:", response.data);
      if (response.data) {
        console.log("Follow-ups:", response.data.followUps);
        setLead(response.data);
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
      alert("Failed to load lead details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFollowUpData({
      ...followUpData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitFollowUp = async (e) => {
    e.preventDefault();
    
    if (!followUpData.note || !followUpData.status) {
      alert("Please fill in note and status fields");
      return;
    }

    try {
      setSubmitting(true);
      const userEmail = localStorage.getItem("userEmail") || "admin@example.com";
      
      const followUpPayload = {
        date: new Date(),
        note: followUpData.note,
        secondNote: followUpData.secondNote,
        followUpDate: followUpData.followUpDate || null,
        status: followUpData.status,
        updatedBy: userEmail,
      };

      await addFollowUp(id, followUpPayload);
      
      // Reset form
      setFollowUpData({
        note: "",
        secondNote: "",
        followUpDate: "",
        status: "",
      });

      // Refresh lead data to show new follow-up
      await fetchLeadData();
      alert("Follow-up added successfully!");
    } catch (error) {
      console.error("Error adding follow-up:", error);
      alert("Failed to add follow-up");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!window.confirm(`Are you sure you want to mark this lead as ${status}?`)) {
      return;
    }

    try {
      await updateLeadStatus(id, status);
      alert(`Lead marked as ${status}`);
      await fetchLeadData();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update lead status");
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Lead not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/sales/leads")}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <MdArrowBack size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Lead Details</h2>
        </div>
        <button
          onClick={fetchLeadData}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          title="Refresh lead data"
        >
          <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Lead Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 font-semibold">Date:</span>
            <span className="ml-2 text-gray-800">{new Date(lead.date || lead.createdAt).toLocaleString("en-IN")}</span>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Project:</span>
            <span className="ml-2 text-gray-800">{lead.projectName || lead.project}</span>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Industry:</span>
            <span className="ml-2 text-gray-800">{lead.industryType || lead.company}</span>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Description:</span>
            <span className="ml-2 text-gray-800">{lead.description || "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Contact Person:</span>
            <span className="ml-2 text-gray-800">{lead.leadName || lead.name}</span>
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
            <span className="ml-2 text-gray-800 capitalize">{lead.status}</span>
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
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? "SUBMITTING..." : "SUBMIT FOLLOW-UP"}
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
        {!loading && lead.followUps && lead.followUps.length > 0 ? (
          <div className="space-y-4">
            {lead.followUps.slice().reverse().map((history, index) => (
              <div key={index} className="border-l-4 border-blue-600 pl-4 py-3 bg-gray-50 rounded-r">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Date:</span> {new Date(history.date).toLocaleString("en-IN")}
                  </p>
                  {history.status && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      history.status === "Converted" ? "bg-green-100 text-green-700" :
                      history.status === "Interested" ? "bg-blue-100 text-blue-700" :
                      history.status === "Not Interested" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {history.status}
                    </span>
                  )}
                </div>
                {history.note && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Note:</span> {history.note}
                  </p>
                )}
                {history.secondNote && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Additional Note:</span> {history.secondNote}
                  </p>
                )}
                {history.followUpDate && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Follow-Up Date:</span> {new Date(history.followUpDate).toLocaleDateString("en-IN")}
                  </p>
                )}
                {history.updatedBy && (
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold">Updated By:</span> {history.updatedBy}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading follow-up history...</p>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 font-medium">No follow-up history yet</p>
            <p className="text-sm text-gray-500 mt-1">Add your first follow-up above</p>
          </div>
        )}
      </div>
    </div>
  );
}