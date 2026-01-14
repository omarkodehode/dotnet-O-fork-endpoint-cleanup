import api from "./apiClient";

const departmentApi = {
  // Get all departments
  getDepartments: async () => {
    const response = await api.get("/departments");
    return response.data;
  },

  // Create a new department
  createDepartment: async (data) => {
    const response = await api.post("/departments", data);
    return response.data;
  },

  // Delete a department
  deleteDepartment: async (id) => {
    return await api.delete(`/departments/${id}`);
  }
};

export default departmentApi;