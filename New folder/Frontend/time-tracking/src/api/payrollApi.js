import api from "./apiClient";

const payrollApi = {
    // Generate
    generate: (data) => api.post("/api/payroll/generate", data),

    // History
    getAll: () => api.get("/api/payroll")
};

export default payrollApi;
