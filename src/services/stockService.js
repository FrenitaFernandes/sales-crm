import axios from "axios";

const API_URL = "http://localhost:5000/api/stock";
const ADMIN_API_URL = "http://localhost:5000/api/admin/stock";

const getAuthToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

export const addStockEntry = async (payload) => {
  const response = await axios.post(`${API_URL}/entry`, payload, getAuthConfig());
  return response.data;
};

export const getStockSummary = async () => {
  const response = await axios.get(`${API_URL}/summary`, getAuthConfig());
  return response.data;
};

export const getStockEntries = async () => {
  const response = await axios.get(`${API_URL}/entry`, getAuthConfig());
  return response.data;
};

export const updateStockEntry = async (entryId, payload) => {
  const response = await axios.put(`${API_URL}/entry/${entryId}`, payload, getAuthConfig());
  return response.data;
};

export const deleteStockEntry = async (entryId, fallbackData = {}) => {
  const id = String(entryId || "").trim();

  const payloadConfig = {
    ...getAuthConfig(),
    data: fallbackData,
  };

  const buildDeleteUrls = (targetId) => [
    `${API_URL}/entry/${encodeURIComponent(targetId)}`,
    `${ADMIN_API_URL}/entry/${encodeURIComponent(targetId)}`,
    `${API_URL}/${encodeURIComponent(targetId)}`,
    `${ADMIN_API_URL}/${encodeURIComponent(targetId)}`,
  ];

  const tryDeleteById = async (targetId) => {
    const deleteUrls = buildDeleteUrls(targetId);

    let lastError;
    for (const url of deleteUrls) {
      try {
        const response = await axios.delete(url, payloadConfig);
        return response.data;
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;

        if (status && status !== 404) {
          throw error;
        }
      }
    }

    throw lastError || new Error("Failed to delete stock entry");
  };

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const tryDeleteByQuery = async () => {
    const itemName = String(fallbackData?.itemName || "").trim();
    if (!itemName) return null;

    const params = new URLSearchParams();
    params.set("itemName", itemName);

    const category = String(fallbackData?.category || "").trim();
    if (category) {
      params.set("category", category);
    }

    const unitPrice = Number(fallbackData?.unitPrice || 0);
    if (unitPrice > 0) {
      params.set("unitPrice", String(unitPrice));
    }

    const queryUrls = [
      `${API_URL}/entry?${params.toString()}`,
      `${ADMIN_API_URL}/entry?${params.toString()}`,
      `${API_URL}?${params.toString()}`,
      `${ADMIN_API_URL}?${params.toString()}`,
    ];

    let lastQueryError;

    for (const url of queryUrls) {
      try {
        const response = await axios.delete(url, getAuthConfig());
        return response.data;
      } catch (error) {
        lastQueryError = error;
        const status = error?.response?.status;

        if (status && status !== 404) {
          throw error;
        }
      }
    }

    throw lastQueryError || new Error("Failed to delete stock entry");
  };

  let lastError;
  if (id) {
    try {
      return await tryDeleteById(id);
    } catch (error) {
      lastError = error;
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  if (fallbackData?.itemName) {
    try {
      const entriesResponse = await getStockEntries();
      const entries = Array.isArray(entriesResponse) ? entriesResponse : (entriesResponse?.data || []);

      const matchingEntries = entries.filter((entry) => {
        const sameName = normalize(entry?.itemName) === normalize(fallbackData.itemName);
        if (!sameName) return false;

        const hasCategory = normalize(fallbackData?.category) !== "";
        const sameCategory = !hasCategory || normalize(entry?.category) === normalize(fallbackData.category);

        const targetPrice = Number(fallbackData?.unitPrice || 0);
        const hasPrice = targetPrice > 0;
        const samePrice = !hasPrice || Number(entry?.price || 0) === targetPrice;

        return sameCategory && samePrice;
      });

      for (const entry of matchingEntries) {
        const candidateId = String(entry?._id || entry?.id || "").trim();
        if (!candidateId) continue;

        try {
          return await tryDeleteById(candidateId);
        } catch (candidateError) {
          lastError = candidateError;
          if (candidateError?.response?.status !== 404) {
            throw candidateError;
          }
        }
      }
    } catch (lookupError) {
      if (!lastError) {
        lastError = lookupError;
      }

      if (lookupError?.response?.status && lookupError.response.status !== 404) {
        throw lookupError;
      }
    }

    try {
      const queryDeleted = await tryDeleteByQuery();
      if (queryDeleted) {
        return queryDeleted;
      }
    } catch (queryError) {
      lastError = queryError;
      if (queryError?.response?.status && queryError.response.status !== 404) {
        throw queryError;
      }
    }
  }

  throw lastError || new Error("Failed to delete stock entry");
};
