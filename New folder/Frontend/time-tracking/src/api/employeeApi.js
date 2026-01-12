import api from "./apiClient";

const employeeApi = {
  // ================= ADMIN OPERATIONS =================
  getAll: async () => {
    const response = await api.get("/employees");
    return response.data; 
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

  // ================= EMPLOYEE SELF-SERVICE =================
  // These connect to the EmployeeAreaEndpoints we built (/employee/...)
  
  getStatus: async () => {
    const response = await api.get("/employee/status");
    return response.data;
  },

  clockIn: async () => {
    const response = await api.post("/employee/clockin");
    return response.data;
  },

  clockOut: async () => {
    const response = await api.post("/employee/clockout");
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/employee/history");
    return response.data;
  },

  getMyAbsences: async () => {
    const response = await api.get("/employee/absences");
    return response.data;
  },

  // For the correction feature (PUT /time-entries/{id})
  updateTimeEntry: async (id, data) => {
    const response = await api.put(`/employee/time-entries/${id}`, data);
    return response.data;
  }
};

export default employeeApi;