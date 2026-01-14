import apiClient from "./apiClient";

export default {
  // ✅ FIX: Added /api prefix to all routes
  getTeam: () => apiClient.get("/api/manager/employees"),
  
  getWeeklySummary: (year, week) => 
    apiClient.get(`/api/manager/summary?year=${year}&week=${week}`),

  getWeeklyDetails: (employeeId, year, week) =>
    apiClient.get(`/api/manager/details/${employeeId}?year=${year}&week=${week}`),

  approveWeek: (employeeId, year, week) =>
    apiClient.post(`/api/manager/approve?employeeId=${employeeId}&year=${year}&week=${week}`),

  getPendingAbsences: () => apiClient.get("/api/manager/absences/pending"),

  toggleAbsenceApproval: (id, approved) =>
    apiClient.post(`/api/manager/absences/${id}/approve?approved=${approved}`),

  createAbsence: (data) => apiClient.post("/api/manager/absences/create", data),

  exportPayroll: (year, month, employeeId = null) => {
    let url = `/api/manager/export-payroll?year=${year}&month=${month}`;
    if (employeeId) {
      url += `&employeeId=${employeeId}`;
    }
    return apiClient.get(url, { responseType: "blob" });
  }
};