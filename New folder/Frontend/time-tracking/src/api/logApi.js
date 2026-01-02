import api from "./apiClient";

const logApi = {
  getAll: () => api.get("/logs"),
};

export default logApi;