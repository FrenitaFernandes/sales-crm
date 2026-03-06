import axios from "axios";

const API_URL = "http://localhost:5000/api/leads";

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
