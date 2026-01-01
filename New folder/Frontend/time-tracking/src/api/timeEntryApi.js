import api from "./apiClient";

const timeEntryApi = {
  // Get current status (Clocked In / Clocked Out)
  getStatus: () => api.get("/employee/status"),

  // Clock In
  clockIn: () => api.post("/employee/clock-in", {}),

  // Clock Out
  clockOut: () => api.post("/employee/clock-out", {}),
  
  // Get history (optional, for dashboard)
  getHistory: () => api.get("/employee/history"),
};

export default timeEntryApi;