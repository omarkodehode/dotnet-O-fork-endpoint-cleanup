import api from "./apiClient";

// Admin Methods
export const getAbsences = () => api.get("/api/absences");

export const createAbsence = (data) => api.post("/api/absences", data);

export const deleteAbsence = (id) => api.delete(`/api/absences/${id}`);

export const getAbsence = (id) => api.get(`/api/absences/${id}`);

export const updateAbsence = (id, data) => api.put(`/api/absences/${id}`, data);

// Employee Methods
export const getMyAbsences = () => api.get("/api/employee/absences");

export const requestAbsence = (data) => api.post("/api/employee/absences", data);