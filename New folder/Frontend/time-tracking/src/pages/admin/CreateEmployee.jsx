import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import employeeApi from "../../api/employeeApi";
import departmentApi from "../../api/departmentApi"; // ✅ FIXED: Default import

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    department: "",
    role: "employee",
    position: "",
    hourlyRate: 0,
    vacationDaysBalance: 15
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // ✅ FIXED: Use method from object
    departmentApi.getDepartments()
      .then(data => setDepartments(data))
      .catch(console.error);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await employeeApi.create(form);
      navigate("/admin/employees");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create employee.");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Employee</h1>
      {error && <p className="text-red-600 mb-4 bg-red-50 p-2 rounded">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input name="name" type="text" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input name="username" type="text" value={form.username} onChange={handleChange} className="w-full p-2 border rounded" required autoComplete="new-username" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" required autoComplete="new-password" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Select Department --</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="employee">Employee</option>
            <option value="manager">Manager</option> {/* ✅ Added Manager */}
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position / Title</label>
          <input name="position" type="text" value={form.position} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
          <input name="hourlyRate" type="number" step="0.01" value={form.hourlyRate} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vacation Days Balance</label>
          <input name="vacationDaysBalance" type="number" value={form.vacationDaysBalance} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
          <button type="button" onClick={() => navigate("/admin/employees")} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}