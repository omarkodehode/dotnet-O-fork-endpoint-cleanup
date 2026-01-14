import api from "./apiClient";

const timeEntryApi = {
  // Get current status
  getStatus: () => api.get("/employee/status"),

  // ✅ FIX: Removed hyphen to match Backend endpoint "/employee/clockin"
  clockIn: () => api.post("/employee/clockin", {}),

  // ✅ FIX: Removed hyphen to match Backend endpoint "/employee/clockout"
  clockOut: () => api.post("/employee/clockout", {}),
  
  // Get history
  getHistory: () => api.get("/employee/history"),

  // ✅ NEW: Flex Balance
  getFlexBalance: () => api.get("/employee/flex-balance"),
};

export default timeEntryApi;