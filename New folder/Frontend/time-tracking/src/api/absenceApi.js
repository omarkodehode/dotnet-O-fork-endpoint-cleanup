import api from "./apiClient";

const absenceApi = {
  // ============ ADMIN METHODS ============
  // Maps to: GET /absences
  getAbsences: () => api.get("/absences"), 
  
  // Maps to: POST /absences
  createAbsence: (data) => api.post("/absences", data),
  
  // Maps to: DELETE /absences/{id}
  deleteAbsence: (id) => api.delete(`/absences/${id}`),

  // Maps to: GET /absences/{id}
  getAbsence: (id) => api.get(`/absences/${id}`),

  // Maps to: PUT /absences/{id}
  updateAbsence: (id, data) => api.put(`/absences/${id}`, data),


  // ============ EMPLOYEE METHODS ============
  // Maps to: GET /absences/my
  getMyAbsences: () => api.get("/absences/my"), 
  
  // Maps to: POST /absences/my
  requestAbsence: (data) => api.post("/absences/my", data), 
};

export default absenceApi;