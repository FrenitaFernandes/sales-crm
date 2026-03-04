import axios from "axios";

const API_URL = "http://localhost:5000/api/invoices";

const getAuthToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

export const createInvoice = async (invoiceData) => {
  const response = await axios.post(API_URL, invoiceData, getAuthConfig());
  return response.data;
};

export const getInvoices = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const getInvoiceById = async (invoiceId) => {
  const response = await axios.get(`${API_URL}/${invoiceId}`, getAuthConfig());
  return response.data;
};

export const updateInvoiceStatus = async (invoiceId, status) => {
  const response = await axios.put(`${API_URL}/${invoiceId}/status`, { status }, getAuthConfig());
  return response.data;
};

export const updateInvoice = async (invoiceId, invoiceData) => {
  const response = await axios.put(`${API_URL}/${invoiceId}`, invoiceData, getAuthConfig());
  return response.data;
};
