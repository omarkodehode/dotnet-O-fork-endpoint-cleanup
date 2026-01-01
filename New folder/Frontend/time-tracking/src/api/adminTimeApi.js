import api from "./apiClient";

const adminTimeApi = {
  // Get list of currently clocked-in employees
  getActiveShifts: () => api.get("/admin/time/active"),

  // Admin clocks in for a user
  clockInUser: (userId) => api.post(`/admin/time/clockin/${userId}`),

  // Admin clocks out for a user
  clockOutUser: (userId) => api.post(`/admin/time/clockout/${userId}`),

  // Get specific user's history
  getUserHistory: (userId) => api.get(`/admin/time/history/${userId}`),
};

export default adminTimeApi;