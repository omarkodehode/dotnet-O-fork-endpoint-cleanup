import apiClient from './apiClient';

// Named exports for backwards compatibility
export const getEmployees = async () => {
  const response = await apiClient.get('/api/employees');
  return response.data;
};

export const getEmployee = async (id) => {
  const response = await apiClient.get(`/api/employees/${id}`);
  return response.data;
};

export const createEmployee = async (data) => {
  const response = await apiClient.post('/api/employees', data);
  return response.data;
};

export const updateEmployee = async (id, data) => {
  const response = await apiClient.put(`/api/employees/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await apiClient.delete(`/api/employees/${id}`);
  return response.data;
};

// Default export object for components using employeeApi.method() syntax
const employeeApi = {
  getAll: getEmployees,
  getById: getEmployee,
  create: createEmployee,
  update: updateEmployee,
  delete: deleteEmployee,
};

export default employeeApi;