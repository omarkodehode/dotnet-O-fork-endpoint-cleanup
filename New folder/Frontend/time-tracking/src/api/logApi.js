import api from "./apiClient";

const logApi = {
  getAll: () => api.get("/api/logs"),
};

export default logApi;