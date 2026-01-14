import api from "./apiClient";

const absenceApi = {
  // ============ ADMIN METHODS ============
  // Maps to: GET /api/absences
  getAbsences: () => api.get("/api/absences"), 
  
  // Maps to: POST /api/absences
  createAbsence: (data) => api.post("/api/absences", data),
  
  // Maps to: DELETE /api/absences/{id}
  deleteAbsence: (id) => api.delete(`/api/absences/${id}`),

  // Maps to: GET /api/absences/{id}
  getAbsence: (id) => api.get(`/api/absences/${id}`),

  // Maps to: PUT /api/absences/{id}
  updateAbsence: (id, data) => api.put(`/api/absences/${id}`, data),


  // ============ EMPLOYEE METHODS ============
  // Maps to: GET /api/employee/absences (Standardized)
  getMyAbsences: () => api.get("/api/employee/absences"),  
  
  // Maps to: POST /api/employee/absences (Standardized)
  // ✅ FIX: Removed trailing slash
  requestAbsence: (data) => api.post("/api/employee/absences", data), 
};

export default absenceApi;