import api from "./apiClient";

const employeeApi = {
  // ================= ADMIN OPERATIONS =================
  getAll: async () => {
    const response = await api.get("/api/employees");
    return response.data; 
  },
  getById: async (id) => {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/employees", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/employees/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/api/employees/${id}`);
  },

  // ================= EMPLOYEE SELF-SERVICE =================
  // These connect to the EmployeeAreaEndpoints we built (/employee/...)
  
  getStatus: async () => {
    const response = await api.get("/api/employee/status");
    return response.data;
  },

  clockIn: async () => {
    const response = await api.post("/api/employee/clockin");
    return response.data;
  },

  clockOut: async () => {
    const response = await api.post("/api/employee/clockout");
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/api/employee/history");
    return response.data;
  },

  getMyAbsences: async () => {
    const response = await api.get("/api/employee/absences");
    return response.data;
  },
  

  // For the correction feature (PUT /time-entries/{id})
  updateTimeEntry: async (id, data) => {
    const response = await api.put(`/api/employee/time-entries/${id}`, data);
    return response.data;
  },
  deleteTimeEntry: async (id) => {
    const response = await api.delete(`/api/employee/time-entries/${id}`)
    return response.data;
  },
};

export default employeeApi;