import axios from "axios";

const apiClient = axios.create({
  // Make sure this matches your running Backend URL
  baseURL: "http://localhost:5192", 
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;