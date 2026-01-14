import api from "./apiClient";

const adminTimeApi = {
  getActiveShifts: () => api.get("/admin/time/active"),

  clockInUser: (employeeId) => api.post(`/admin/time/clockin/${employeeId}`),

  clockOutUser: (employeeId) => api.post(`/admin/time/clockout/${employeeId}`),

  getUserHistory: (userId) => api.get(`/admin/time/history/${userId}`),

  // ✅ NEW: Global Export
  exportGlobalPayroll: (year, month) => api.get(`/admin/time/export-payroll?year=${year}&month=${month}`, {
    responseType: 'blob',
  }),
};

export default adminTimeApi;