import { useEffect, useState } from "react";
// ✅ FIX: Named imports
import { getPendingAbsences, toggleAbsenceApproval } from "../../api/managerApi";

export default function ManagerApprovals() {
  const [pendingAbsences, setPendingAbsences] = useState([]);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      // ✅ FIX: Direct function call
      const res = await getPendingAbsences();
      setPendingAbsences(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAbsenceDecision = async (id, approved) => {
    try {
      // ✅ FIX: Direct function call
      await toggleAbsenceApproval(id, approved);
      fetchAbsences();
    } catch (err) { alert("Action failed."); }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Approve Absences</h1>

      <div className="bg-white rounded-xl shadow p-6 border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Pending Requests</h2>
        
        <div className="space-y-4">
          {pendingAbsences.filter(a => !a.approved).map(a => (
            <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-lg">{a.employeeName}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-600 uppercase">{a.type}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                    {new Date(a.startDate).toLocaleDateString()} — {new Date(a.endDate).toLocaleDateString()}
                </p>
                {a.description && <p className="text-sm text-slate-400 italic mt-1">"{a.description}"</p>}
              </div>
              
              <div className="flex gap-3">
                <button 
                    onClick={() => handleAbsenceDecision(a.id, true)} 
                    className="flex-1 sm:flex-none bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition-colors text-sm border border-emerald-200"
                >
                    Approve
                </button>
                <button 
                    onClick={() => handleAbsenceDecision(a.id, false)} 
                    className="flex-1 sm:flex-none bg-rose-100 text-rose-700 px-4 py-2 rounded-lg font-bold hover:bg-rose-200 transition-colors text-sm border border-rose-200"
                >
                    Reject
                </button>
              </div>
            </div>
          ))}
          
          {pendingAbsences.filter(a => !a.approved).length === 0 && (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-slate-500 font-medium">All caught up! No pending requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}