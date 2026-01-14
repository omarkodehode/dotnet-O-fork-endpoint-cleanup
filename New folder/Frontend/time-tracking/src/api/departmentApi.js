import api from "./apiClient";

// Exporting functions individually (Named Exports)
export const getDepartments = async () => {
  const response = await api.get("/api/departments");
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post("/api/departments", data);
  return response.data;
};

export const deleteDepartment = async (id) => {
  return await api.delete(`/api/departments/${id}`);
};