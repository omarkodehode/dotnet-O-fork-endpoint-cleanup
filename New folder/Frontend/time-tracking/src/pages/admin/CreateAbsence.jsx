import { useState } from "react";
import { useNavigate } from "react-router-dom";
import absenceApi from "../../api/absenceApi";

export default function CreateAbsence() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: "", date: "", reason: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await absenceApi.createAbsence({
        ...form,
        employeeId: parseInt(form.employeeId)
      });
      navigate("/admin/absences");
    } catch (err) {
      setError("Failed to create. Check Employee ID and ensure no duplicate dates.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h1 className="text-2xl font-bold mb-6">Record Absence</h1>
      {error && <p className="mb-4 text-red-600 bg-red-50 p-3 rounded text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
          <input
            id="employeeId"
            name="employeeId"
            type="number"
            required
            className="w-full p-2 border rounded-lg"
            placeholder="ID from Employee List"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="w-full p-2 border rounded-lg"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
          <input
            id="reason"
            name="reason"
            type="text"
            required
            className="w-full p-2 border rounded-lg"
            placeholder="Reason for absence"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Save</button>
          <button type="button" onClick={() => navigate("/admin/absences")} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200">Cancel</button>
        </div>
      </form>
    </div>
  );
}