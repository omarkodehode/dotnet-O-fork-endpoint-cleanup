import axios from "axios";

const api = axios.create({
  // FIX: Explicitly set to 5192 to match launchSettings.json
  baseURL: "http://localhost:5192", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Call Failed:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;