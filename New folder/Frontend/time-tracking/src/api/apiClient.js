import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5192",
  headers: { "Content-Type": "application/json" },
});

// Automatically attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers = config.headers || {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
