import apiClient from "./apiClient";

const getActive = () => apiClient.get("/admin/time/active");
const clockInForUser = (userId) => apiClient.post(`/admin/time/clockin/${userId}`);
const clockOutForUser = (userId) => apiClient.post(`/admin/time/clockout/${userId}`);
const getHistory = (userId) => apiClient.get(`/admin/time/history/${userId}`);

export default { getActive, clockInForUser, clockOutForUser, getHistory };
