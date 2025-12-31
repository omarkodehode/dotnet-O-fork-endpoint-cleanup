import { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function EmployeeAbsences() {
  const [absences, setAbsences] = useState([]);
  const [form, setForm] = useState({ date: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchAbsences(); }, []);

  const fetchAbsences = async () => {
    try {
      const res = await api.get("/employee/absences");
      setAbsences(res.data);
    } catch(err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/employee/absences", form);
      setForm({ date: "", reason: "" });
      fetchAbsences();
    } catch(e) { alert("Failed to submit"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/employee/dashboard")} className="mb-6 text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1">
          ← Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left: Request Form */}
          <div className="w-full md:w-1/3">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1">New Request</h2>
              <p className="text-slate-500 text-sm mb-6">Submit a new absence for approval.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                  <textarea 
                    required
                    rows="3"
                    value={form.reason}
                    onChange={e => setForm({...form, reason: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                    placeholder="E.g. Sick leave, Vacation..."
                  ></textarea>
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-70"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: History List */}
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Request History</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {absences.length === 0 && (
                  <li className="p-8 text-center text-slate-400">No absence history found.</li>
                )}
                {absences.map((a) => (
                  <li key={a.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        📅
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-slate-500 text-sm mt-0.5">{a.reason}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                      Approved
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}