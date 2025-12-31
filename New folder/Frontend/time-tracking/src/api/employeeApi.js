import apiClient from "./apiClient";

// Admin: Get all employees
const getEmployees = () => apiClient.get("/employees");

// Admin: Get single employee by ID
const getEmployee = (id) => apiClient.get(`/employees/${id}`);

// Admin: Create employee
const createEmployee = (data) => apiClient.post("/employees", data);

// Admin: Update employee
const updateEmployee = (id, data) => apiClient.put(`/employees/${id}`, data);

// Admin: Delete employee
const deleteEmployee = (id) => apiClient.delete(`/employees/${id}`);

// Employee: Get own absences
const getOwnAbsences = () => apiClient.get("/employee/absences");

// Employee: Clock in
const clockIn = () => apiClient.post("/employee/clockin");

// Employee: Clock out
const clockOut = () => apiClient.post("/employee/clockout");

// Employee: Create absence
const createAbsence = (data) => apiClient.post("/employee/absences", data);

export default {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getOwnAbsences,
  clockIn,
  clockOut,
  createAbsence,
};
