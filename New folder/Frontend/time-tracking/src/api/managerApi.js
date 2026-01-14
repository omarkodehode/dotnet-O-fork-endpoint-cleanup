// src/api/managerApi.js
import api from "./apiClient";

const managerApi = {
  // 1. Get Weekly Summary (Review Hours)
  getWeeklySummary: (year, week) => 
    api.get(`/api/manager/weekly-summary?year=${year}&week=${week}`),


  getWeeklyDetails: (employeeId, year, week) =>
    api.get(`/api/manager/weekly-details/${employeeId}?year=${year}&week=${week}`),
  // 2. Approve Week
  approveWeek: (employeeId, year, week) => 
    api.post(`/api/manager/approve-week/${employeeId}`, { year, week }),

  // 3. Get Pending Absences
  getPendingAbsences: () => 
    api.get("/api/manager/absences"),

  // 4. Approve/Reject Absence
  toggleAbsenceApproval: (id, approved) => 
    api.post(`/api/manager/absences/${id}/approve`, { approved }),
  // 5. Get My Team
  getTeam: () => 
    api.get("/api/manager/employees"),

  // 6. Create Absence (Manager)
  createAbsence: (data) => 
    api.post("/api/manager/absences", data),

  // 7. Export Payroll
  exportPayroll: (year, month) => 
    api.get(`/api/manager/export-payroll?year=${year}&month=${month}`, {
      responseType: "blob" // Important for file download
    })
};

export default managerApi;