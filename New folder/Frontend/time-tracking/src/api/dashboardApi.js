import api from "./apiClient";

const dashboardApi = {
  getStats: () => api.get("/api/dashboard"),
};

export default dashboardApi;