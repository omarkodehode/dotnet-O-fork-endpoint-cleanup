import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiClient"; // Assuming you have a general API client or adminApi

export default function Absences() {
  const navigate = useNavigate();
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const res = await api.get("/api/absences"); // Admin endpoint to get all
      setAbsences(res.data);
    } catch (err) { console.error(err); }
  };

  const handleApprove = async (id, approved) => {
    try {
      await api.post(`/api/manager/absences/${id}/approve?approved=${approved}`);
      fetchAbsences();
    } catch (err) { alert("Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">All Absences</h1>
        <button
          onClick={() => navigate("/admin/absences/create")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <span>➕</span> Add Absence
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Employee</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Type</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {absences.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-700">{a.employee?.fullName || 'Unknown'}</td>
                {/* ✅ FIX: Using startDate / endDate */}
                <td className="p-4 text-sm text-slate-600">
                  {new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{a.type}</span>
                </td>
                <td className="p-4 text-sm text-slate-500 italic">{a.description || '-'}</td>
                <td className="p-4 text-right">
                  {a.approved
                    ? <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-100">APPROVED</span>
                    : <div className="flex justify-end gap-2">
                      <button onClick={() => handleApprove(a.id, true)} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Approve</button>
                      <button onClick={() => handleApprove(a.id, false)} className="text-xs bg-rose-600 text-white px-3 py-1 rounded hover:bg-rose-700">Reject</button>
                    </div>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}