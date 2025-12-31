import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await authApi.login(form);
      // Save token and role returned from server (backend returns { token, user })
      const token = res?.data?.token;
      const role = res?.data?.role ?? res?.data?.user?.role;

      if (token) localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);

      if (role === "admin") navigate("/admin/dashboard");
      else navigate("/employee/dashboard");
    } catch (err) {
      // Log full error for debugging and show server message when available
      // eslint-disable-next-line no-console
      console.error("Login error:", err);
      const serverMsg = err?.response?.data?.message || err?.response?.data || null;
      setError(serverMsg || "Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h1>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Username</span>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </label>

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Login
        </button>
      </form>
    </div>
  );
}
