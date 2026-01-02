import api from "./apiClient";

const employeeApi = {
  getAll: async () => {
    const response = await api.get("/employees");
    return response.data; // ✅ Returns the actual array directly
  },
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/employees", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/employees/${id}`);
  },
};

export default employeeApi;