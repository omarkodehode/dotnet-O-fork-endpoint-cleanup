import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import employeeApi from "../../api/employeeApi"; 

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    department: "",
    role: "employee",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await employeeApi.create(form);
      navigate("/admin/employees");
    } catch (err) {
      setError("Failed to create employee.");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Employee</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="jdoe"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            autoComplete="new-username"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            autoComplete="new-password"
          />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input
            id="department"
            name="department"
            type="text"
            placeholder="IT, HR..."
            value={form.department}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}