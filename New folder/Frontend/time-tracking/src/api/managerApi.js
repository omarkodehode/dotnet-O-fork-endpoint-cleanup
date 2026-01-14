// src/api/managerApi.js
import api from "./apiClient";

const managerApi = {
  // 1. Get Weekly Summary (Review Hours)
  getWeeklySummary: (year, week) => 
    api.get(`/manager/weekly-summary?year=${year}&week=${week}`),

  // 2. Approve Week
  approveWeek: (employeeId, year, week) => 
    api.post(`/manager/approve-week/${employeeId}`, { year, week }),

  // 3. Get Pending Absences
  getPendingAbsences: () => 
    api.get("/manager/absences"),

  // 4. Approve/Reject Absence
  toggleAbsenceApproval: (id, approved) => 
    api.post(`/manager/absences/${id}/approve`, approved, {
      headers: { "Content-Type": "application/json" } // Send boolean as JSON
    }),

  // 5. Get My Team
  getTeam: () => 
    api.get("/manager/employees"),

  // 6. Create Absence (Manager)
  createAbsence: (data) => 
    api.post("/manager/absences", data),

  // 7. Export Payroll
  exportPayroll: (year, month) => 
    api.get(`/manager/export-payroll?year=${year}&month=${month}`, {
      responseType: "blob" // Important for file download
    })
};

export default managerApi;