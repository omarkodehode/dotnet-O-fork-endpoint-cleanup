import { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function Absences() {
  const [absences, setAbsences] = useState([]);
  const [form, setForm] = useState({ date: "", reason: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchAbsences = async () => {
    try {
      const res = await api.get("/employee/absences");
      setAbsences(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load absences. Ensure you are logged in.");
    }
  };

  useEffect(() => { fetchAbsences(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/employee/absences", form);
      setForm({ date: "", reason: "" });
      fetchAbsences(); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create absence.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Absences</h1>
        <button onClick={() => navigate("/employee/dashboard")} className="text-indigo-600 hover:underline">
          ← Dashboard
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="font-bold text-lg mb-4">Request Time Off</h2>
          {error && <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded border border-red-100">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Date</label>
              <input 
                type="date" 
                required 
                className="w-full p-2 border rounded-lg"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Reason</label>
              <input 
                type="text" 
                required 
                placeholder="Sick leave..."
                className="w-full p-2 border rounded-lg"
                value={form.reason}
                onChange={e => setForm({...form, reason: e.target.value})}
              />
            </div>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
              Submit
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {absences.length === 0 && (
                <tr><td colSpan="3" className="p-4 text-center text-slate-400">No records found.</td></tr>
              )}
              {absences.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-4">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="p-4">{a.reason}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${a.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
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