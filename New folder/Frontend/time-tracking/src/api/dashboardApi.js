import api from "./apiClient";

const dashboardApi = {
  getStats: () => api.get("/dashboard"),
};

export default dashboardApi;