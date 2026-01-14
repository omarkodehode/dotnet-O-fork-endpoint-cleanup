import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for existing token on load
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // SAFETY: Force role to lowercase even from storage
        if (parsedUser.role) {
          parsedUser.role = parsedUser.role.toLowerCase();
        }

        setUser(parsedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("✅ Auth Loaded from Storage:", parsedUser);
      } catch (err) {
        console.error("❌ Corrupt user data in storage, clearing...", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    console.log("⏳ Attempting Login...");
    try {
      const res = await api.post("/api/auth/login", { username, password });

      const { token, user: apiUser } = res.data;

      if (!apiUser) throw new Error("No user data in response");

      // This ensures the Sidebar checks (=== "admin") always pass.
      const cleanRole = apiUser.role ? apiUser.role.toLowerCase() : "guest";

      const userData = {
        id: apiUser.id,
        username: apiUser.username,
        role: cleanRole
      };

      console.log("✅ Login Success. Role is:", cleanRole);

      // Save to storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Set axios header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return userData; // Return for the Login page to use if needed
    } catch (error) {
      console.error("❌ Login Failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    console.log("🔒 Logged Out");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);