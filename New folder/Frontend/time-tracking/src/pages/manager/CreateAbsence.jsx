import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import absenceApi from "../../api/absenceApi";
import employeeApi from "../../api/employeeApi";

export default function CreateAbsence() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    type: "Vacation",
    description: "" // Renamed from 'reason' to match backend
  });
  const [error, setError] = useState("");

  const absenceTypes = [
    "Vacation",
    "SickLeave",
    "SelfCertified",
    "ChildSick",
    "UnpaidLeave",
    "Other"
  ];

  useEffect(() => {
    employeeApi.getAll()
      .then(data => setEmployees(data || []))
      .catch(err => console.error("Failed to load employees", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.startDate || !form.endDate) {
      setError("Please select both Start and End dates.");
      return;
    }

    try {
      await absenceApi.createAbsence({
        employeeId: parseInt(form.employeeId),
        startDate: form.startDate,
        endDate: form.endDate,
        type: form.type,
        description: form.description,
        approved: true // Admins usually auto-approve their own creations
      });
      navigate("/admin/absences");
    } catch (err) {
      console.error(err);
      setError("Failed to create. Ensure dates are valid and no overlap exists.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Record Absence</h1>
      {error && <p className="mb-4 text-red-600 bg-red-50 p-3 rounded text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* EMPLOYEE SELECT */}
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">Select Employee</label>
          <select
            id="employeeId"
            name="employeeId"
            required
            className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
            value={form.employeeId}
            onChange={handleChange}
          >
            <option value="">-- Choose Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.user?.username || "No User"})
              </option>
            ))}
          </select>
        </div>

        {/* DATES ROW */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* TYPE */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Absence Type</label>
          <select
            id="type"
            name="type"
            className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
            value={form.type}
            onChange={handleChange}
          >
            {absenceTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description / Reason</label>
          <textarea
            id="description"
            name="description"
            className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
            placeholder="Reason for absence..."
            rows="3"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 shadow">Save Absence</button>
          <button type="button" onClick={() => navigate("/admin/absences")} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200">Cancel</button>
        </div>
      </form>
    </div>
  );
}