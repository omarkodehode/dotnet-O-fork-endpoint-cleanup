import api from "./apiClient";

export const login = async (username, password) => {
  const response = await api.post("/api/auth/login", { username, password });
  return response.data;
};

// ✅ NEW
export const changePassword = async (data) => {
  return await api.post("/api/auth/change-password", data);
};

// ✅ NEW
export const resetPassword = async (data) => {
  return await api.post("/api/auth/reset-password", data);
};