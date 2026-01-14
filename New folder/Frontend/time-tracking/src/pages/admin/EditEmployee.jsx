import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import employeeApi from "../../api/employeeApi";
import departmentApi from "../../api/departmentApi";
import * as authApi from "../../api/auth";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    position: "",
    departmentId: "",
    managerId: "",
    userId: null,
    hourlyRate: 0,
    vacationDaysBalance: 0
  });

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    departmentApi.getDepartments().then(setDepartments).catch(console.error);
    employeeApi.getAll().then(setEmployees).catch(console.error);

    employeeApi.getById(id)
      .then(res => {
        setForm({
          fullName: res.fullName || "",
          position: res.position || "",
          departmentId: res.departmentId || "",
          managerId: res.managerId || "",
          userId: res.userId || null,
          hourlyRate: res.hourlyRate || 0,
          vacationDaysBalance: res.vacationDaysBalance || 0
        });
      })
      .catch(() => setError("Failed to load employee data."));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: form.fullName,
        position: form.position,
        departmentId: form.departmentId ? parseInt(form.departmentId) : null,
        managerId: form.managerId ? parseInt(form.managerId) : null,
        hourlyRate: parseFloat(form.hourlyRate),
        vacationDaysBalance: parseInt(form.vacationDaysBalance)
      };

      await employeeApi.update(id, payload);
      navigate("/admin/employees");
    } catch (err) {
      console.error(err);
      setError("Failed to update employee.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
      {error && <p className="mb-4 text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Position / Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={form.position}
            onChange={e => setForm({ ...form, position: e.target.value })}
          />
        </div>

        {/* Department Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Department</label>
          <select
            className="w-full p-2 border rounded"
            value={form.departmentId}
            onChange={e => setForm({ ...form, departmentId: e.target.value })}
          >
            <option value="">-- No Department --</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Manager Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Manager</label>
          <select
            className="w-full p-2 border rounded"
            value={form.managerId}
            onChange={e => setForm({ ...form, managerId: e.target.value })}
          >
            <option value="">-- No Manager --</option>
            {employees
              .filter(emp => emp.id !== parseInt(id))
              .map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
          </select>
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Hourly Rate</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={form.hourlyRate}
            onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
          />
        </div>

        {/* Vacation Balance */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Vacation Days Balance</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={form.vacationDaysBalance}
            onChange={e => setForm({ ...form, vacationDaysBalance: e.target.value })}
          />
        </div>

        {/* Security / Password Reset Section */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Security</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Reset Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full p-2 border rounded mt-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!newPassword) return alert("Enter a password");
                try {
                  if (!form.userId) return alert("User ID not found for this employee (they might not have a login).");

                  await authApi.resetPassword({ userId: form.userId, newPassword });
                  alert("Password reset successfully");
                  setNewPassword("");
                } catch (e) {
                  console.error(e);
                  alert("Failed to reset password");
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Save Changes</button>
          <button type="button" onClick={() => navigate("/admin/employees")} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">Cancel</button>
        </div>
      </form >
    </div >
  );
}