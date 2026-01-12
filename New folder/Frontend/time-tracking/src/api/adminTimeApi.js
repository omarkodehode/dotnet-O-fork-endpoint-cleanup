import api from "./apiClient";

const adminTimeApi = {
  getActiveShifts: () => api.get("/admin/time/active"),

  clockInUser: (employeeId) => api.post(`/admin/time/clockin/${employeeId}`),

  clockOutUser: (employeeId) => api.post(`/admin/time/clockout/${employeeId}`),

  getUserHistory: (userId) => api.get(`/admin/time/history/${userId}`),
};

export default adminTimeApi;