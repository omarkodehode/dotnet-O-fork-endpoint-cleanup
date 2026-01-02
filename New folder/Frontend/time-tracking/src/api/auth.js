import api from "./apiClient";

export const login = async (username, password) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

// ✅ NEW
export const changePassword = async (data) => {
  return await api.post("/auth/change-password", data);
};

// ✅ NEW
export const resetPassword = async (data) => {
  return await api.post("/auth/reset-password", data);
};