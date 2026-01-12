import api from "./apiClient";

const adminTimeApi = {
  // Get list of currently clocked-in employees
  getActiveShifts: () => api.get("/admin/time/active"),

  // ✅ FIX: Use employeeId to match the new Backend endpoint
  clockInUser: (employeeId) => api.post(`/admin/time/clockin/${employeeId}`),

  // ✅ FIX: Use employeeId
  clockOutUser: (employeeId) => api.post(`/admin/time/clockout/${employeeId}`),

  // Get specific user's history
  getUserHistory: (userId) => api.get(`/admin/time/history/${userId}`),
};

export default adminTimeApi;