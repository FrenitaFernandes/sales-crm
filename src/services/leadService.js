import axios from "axios";

const API_URL = "http://localhost:5000/api/leads";

const getFilenameFromDisposition = (dispositionHeader) => {
  if (!dispositionHeader) {
    return null;
  }

  const utf8Match = dispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = dispositionHeader.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] || null;
};

// Helper function to get auth token
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ======================
// CHECK CUSTOMER BY EMAIL
// ======================
export const checkCustomerByEmail = async (email) => {
  const response = await axios.get(
    `${API_URL}/check-customer?email=${encodeURIComponent(email)}`,
    getAuthConfig()
  );
  return response.data;
};

// ======================
// CREATE LEAD
// ======================
export const createLead = async (leadData) => {
  const response = await axios.post(API_URL, leadData, getAuthConfig());
  return response.data;
};

// ======================
// GET ALL LEADS
// ======================
export const getAllLeads = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

// ======================
// GET TODAY'S LEADS
// ======================
export const getTodayLeads = async () => {
  const response = await axios.get(`${API_URL}/today`, getAuthConfig());
  return response.data;
};

// ======================
// GET LEAD BY ID
// ======================
export const getLeadById = async (leadId) => {
  const response = await axios.get(`${API_URL}/${leadId}`, getAuthConfig());
  return response.data;
};

// ======================
// UPDATE LEAD
// ======================
export const updateLead = async (leadId, leadData) => {
  const response = await axios.put(`${API_URL}/${leadId}`, leadData, getAuthConfig());
  return response.data;
};

// ======================
// DELETE LEAD
// ======================
export const deleteLead = async (leadId) => {
  const response = await axios.delete(`${API_URL}/${leadId}`, getAuthConfig());
  return response.data;
};

// ======================
// ADD FOLLOW UP
// ======================
export const addFollowUp = async (leadId, followUpData) => {
  const response = await axios.post(
    `${API_URL}/${leadId}/followup`,
    followUpData,
    getAuthConfig()
  );
  return response.data;
};

// ======================
// UPDATE LEAD STATUS
// ======================
export const updateLeadStatus = async (leadId, status) => {
  const response = await axios.put(
    `${API_URL}/${leadId}/status`,
    { status },
    getAuthConfig()
  );
  return response.data;
};

// ======================
// EXPORT LEADS TO PDF
// ======================
export const exportLeadsToPDF = async (leadsData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_URL}/export/pdf`,
      { leads: leadsData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    const contentType = response.headers["content-type"] || response.data?.type || "";
    if (!contentType.toLowerCase().includes("pdf")) {
      throw new Error("Invalid PDF response from server");
    }

    return {
      blob: response.data,
      filename:
        getFilenameFromDisposition(response.headers["content-disposition"]) ||
        `leads_${Date.now()}.pdf`,
    };
  } catch (error) {
    const errorBlob = error.response?.data;

    if (errorBlob instanceof Blob) {
      try {
        const errorText = await errorBlob.text();
        const parsed = JSON.parse(errorText);
        throw new Error(parsed.message || "Failed to generate PDF");
      } catch (_parseError) {
        throw new Error("Failed to generate PDF");
      }
    }

    throw error;
  }
};
