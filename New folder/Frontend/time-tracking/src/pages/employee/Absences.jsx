import { useState, useEffect } from "react";
import api from "../../api/apiClient";

export default function Absences() {
  const [absences, setAbsences] = useState([]);
  // ✅ FIX: State names match Backend DTO exactly
  const [form, setForm] = useState({ startDate: "", endDate: "", type: "Vacation", description: "" });
  const [error, setError] = useState("");

  const fetchAbsences = async () => {
    try {
      const res = await api.get("/api/employee/absences");
      setAbsences(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAbsences(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    try {
      // ✅ FIX: Backend expects { startDate, endDate ... }
      await api.post("/api/employee/absences", form);
      setForm({ startDate: "", endDate: "", type: "Vacation", description: "" });
      fetchAbsences();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create absence.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Absences</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="font-bold text-lg mb-4 text-slate-700">Request Time Off</h2>
          {error && <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <input
                type="date"
                required
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <input
                type="date"
                required
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="Vacation">Vacation</option>
                <option value="SickLeave">Sick Leave</option>
                <option value="SelfCertified">Self Certified</option>
                <option value="ChildSick">Child Sick</option>
                <option value="UnpaidLeave">Unpaid Leave</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Submit Request
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Date Range</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {absences.length === 0 && (
                <tr><td colSpan="3" className="p-6 text-center text-slate-400">No absence records found.</td></tr>
              )}
              {absences.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  {/* ✅ FIX: Displaying startDate / endDate */}
                  <td className="p-4 text-sm font-medium text-slate-700">
                    {new Date(a.startDate).toLocaleDateString()}
                    <span className="text-slate-400 mx-2">→</span>
                    {new Date(a.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-xs font-bold">
                      {a.type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${a.approved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                      {a.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}