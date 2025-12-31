import apiClient from "./apiClient";

const login = (data) => apiClient.post("/auth/login", data);
const register = (data) => apiClient.post("/auth/register", data);

export default { login, register };
