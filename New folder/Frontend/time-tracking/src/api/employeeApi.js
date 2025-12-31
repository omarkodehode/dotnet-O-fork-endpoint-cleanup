import api from "./apiClient";

const employeeApi = {
  getAll: () => api.get("/employees"),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

export default employeeApi;