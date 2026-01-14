import api from "./apiClient";

const adminTimeApi = {
  getActiveShifts: () => api.get("/api/admin/time/active"),

  clockInUser: (employeeId) => api.post(`/api/admin/time/clockin/${employeeId}`),

  clockOutUser: (employeeId) => api.post(`/api/admin/time/clockout/${employeeId}`),

  getUserHistory: (userId) => api.get(`/api/admin/time/history/${userId}`),

  // ✅ NEW: Global Export
  exportGlobalPayroll: (year, month) => api.get(`/api/admin/time/export-payroll?year=${year}&month=${month}`, {
    responseType: 'blob',
  }),
};

export default adminTimeApi;