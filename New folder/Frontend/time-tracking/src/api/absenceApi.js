import apiClient from "./apiClient";

// Admin: Get all absences
const getAbsences = () => apiClient.get("/absences");

// Admin: Get single absence by ID
const getAbsence = (id) => apiClient.get(`/absences/${id}`);

// Admin: Create absence
const createAbsence = (data) => apiClient.post("/absences", data);

// Admin: Update absence
const updateAbsence = (id, data) => apiClient.put(`/absences/${id}`, data);

// Admin: Delete absence
const deleteAbsence = (id) => apiClient.delete(`/absences/${id}`);

export default {
  getAbsences,
  getAbsence,
  createAbsence,
  updateAbsence,
  deleteAbsence,
};
