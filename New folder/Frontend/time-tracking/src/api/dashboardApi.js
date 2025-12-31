import apiClient from "./apiClient";

export const getDashboard = async () => {
  const res = await apiClient.get("/dashboard"); // Adjust endpoint if needed
  return res.data;
};

export default { getDashboard };
