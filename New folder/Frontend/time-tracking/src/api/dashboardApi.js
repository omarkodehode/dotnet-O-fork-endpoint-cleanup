import api from "./apiClient";

const dashboardApi = {
  // FIX: Changed endpoint from "/dashboard/stats" to "/dashboard"
  getStats: () => api.get("/dashboard"),
};

export default dashboardApi;