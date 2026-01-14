import apiClient from "./apiClient";

// ✅ Added getManagers to fix the dropdown in CreateEmployee.jsx
export const getManagers = async () => {
  // Fetches all employees and filters for those with Manager role
  const response = await apiClient.get("/api/employees");
  return response.data.filter(emp => 
    emp.user?.role === 'Manager' || emp.role === 'Manager'
  );
};

export const getTeam = () => 
  apiClient.get("/api/manager/employees");

export const getWeeklySummary = (year, week) => 
  apiClient.get(`/api/manager/summary?year=${year}&week=${week}`);

export const getWeeklyDetails = (employeeId, year, week) =>
  apiClient.get(`/api/manager/details/${employeeId}?year=${year}&week=${week}`);

export const approveWeek = (employeeId, year, week) =>
  apiClient.post(`/api/manager/approve?employeeId=${employeeId}&year=${year}&week=${week}`);

export const getPendingAbsences = () => 
  apiClient.get("/api/manager/absences/pending");

export const toggleAbsenceApproval = (id, approved) =>
  apiClient.post(`/api/manager/absences/${id}/approve?approved=${approved}`);

export const createAbsence = (data) => 
  apiClient.post("/api/manager/absences/create", data);

export const exportPayroll = (year, month, employeeId = null) => {
  let url = `/api/manager/export-payroll?year=${year}&month=${month}`;
  if (employeeId) {
    url += `&employeeId=${employeeId}`;
  }
  return apiClient.get(url, { responseType: "blob" });
};