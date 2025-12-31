import api from "./apiClient";

const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};

export default dashboardApi;