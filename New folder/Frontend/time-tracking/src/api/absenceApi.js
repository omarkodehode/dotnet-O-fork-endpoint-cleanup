import api from "./apiClient";

const absenceApi = {
  // ============ ADMIN METHODS ============
  // Maps to: GET /absences
  getAbsences: () => api.get("/api/absences"), 
  
  // Maps to: POST /absences
  createAbsence: (data) => api.post("/api/absences", data),
  
  // Maps to: DELETE /absences/{id}
  deleteAbsence: (id) => api.delete(`/api/absences/${id}`),

  // Maps to: GET /absences/{id}
  getAbsence: (id) => api.get(`/api/absences/${id}`),

  // Maps to: PUT /absences/{id}
  updateAbsence: (id, data) => api.put(`/api/absences/${id}`, data),


  // ============ EMPLOYEE METHODS ============
  // Maps to: GET /absences/my
getMyAbsences: () => api.get("/api/employee/absences"),  
  // Maps to: POST /absences/my
  requestAbsence: (data) => api.post("/api/employee/absences/", data), 
};

export default absenceApi;