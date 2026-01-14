import api from "./apiClient";

const timeEntryApi = {
  // Get current status
  getStatus: () => api.get("/api/employee/status"),

  // ✅ FIX: Removed hyphen to match Backend endpoint "/employee/clockin"
  clockIn: () => api.post("/api/employee/clockin", {}),

  // ✅ FIX: Removed hyphen to match Backend endpoint "/employee/clockout"
  clockOut: () => api.post("/api/employee/clockout", {}),
  
  // Get history
  getHistory: () => api.get("/api/employee/history"),

  // ✅ NEW: Flex Balance
  getFlexBalance: () => api.get("/api/employee/flex-balance"),
};

export default timeEntryApi;