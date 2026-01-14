import api from "./apiClient";

const payrollApi = {
    // Generate
    generate: (data) => api.post("/payroll/generate", data),

    // History
    getAll: () => api.get("/payroll")
};

export default payrollApi;
