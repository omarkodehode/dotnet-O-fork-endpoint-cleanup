import { useEffect, useState } from "react";
import { getWeeklySummary, getWeeklyDetails, approveWeek } from "../../api/managerApi";

// Helper to get week number
const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

export default function ManagerDashboard() {
  const [currentWeek, setCurrentWeek] = useState(getWeekNumber(new Date()));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [teamSummary, setTeamSummary] = useState([]);

  // Modal State
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [currentWeek, currentYear]);

  const fetchSummary = async () => {
    try {
      const res = await getWeeklySummary(currentYear, currentWeek);
      setTeamSummary(res.data);
    } catch (err) { console.error(err); }
  };

  const handleViewDetails = async (empId, empName) => {
    try {
      const res = await getWeeklyDetails(empId, currentYear, currentWeek);
      setSelectedEmployeeDetails({ name: empName, entries: res.data });
      setIsModalOpen(true);
    } catch (err) {
      alert("Failed to load details.");
    }
  };

  const handleApproveWeek = async (empId) => {
    if (!window.confirm("Lock this week for this employee?")) return;
    try {
      await approveWeek(empId, currentYear, currentWeek);
      fetchSummary();
      if (isModalOpen) setIsModalOpen(false);
    } catch (err) { alert("Failed to approve."); }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Review Hours</h1>

      <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Week {currentWeek} / {currentYear}</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentWeek(p => p - 1)} className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200 text-sm font-medium">Previous</button>
            <button onClick={() => setCurrentWeek(p => p + 1)} className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200 text-sm font-medium">Next</button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th className="py-3 px-2">Employee</th>
              <th className="py-3 px-2">Online</th>
              <th className="py-3 px-2">Absence</th>
              <th className="py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {teamSummary.map(s => (
              <tr key={s.employeeId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-2 font-medium text-slate-900">{s.name}</td>
                <td className="py-4 px-2 text-slate-600">{s.totalHours}h</td>
                <td className="py-4 px-2 text-slate-500">{s.absenceHours || 0}h</td>
                <td className="py-4 px-2">
                  {s.absenceHours > 0
                    ? <span className="text-amber-700 text-xs font-bold bg-amber-100 px-2 py-1 rounded-full border border-amber-200">ABSENCE</span>
                    : <span className="text-emerald-700 text-xs font-bold bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200">ACTIVE</span>}
                </td>
              </tr>
            ))}
            {teamSummary.length === 0 && (
              <tr><td colSpan="4" className="py-8 text-center text-slate-400 italic">No time entries found for this week.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && selectedEmployeeDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            <h3 className="text-lg font-bold mb-4 text-slate-800">Details: <span className="text-indigo-600">{selectedEmployeeDetails.name}</span></h3>

            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {selectedEmployeeDetails.entries.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-3 font-semibold border-b">Date</th>
                      <th className="p-3 font-semibold border-b">In</th>
                      <th className="p-3 font-semibold border-b">Out</th>
                      <th className="p-3 font-semibold border-b text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedEmployeeDetails.entries.map((e, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-700">{new Date(e.clockIn).toLocaleDateString()}</td>
                        <td className="p-3 text-slate-500">{new Date(e.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-3 text-slate-500">
                          {e.clockOut
                            ? new Date(e.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : <span className="text-emerald-600 font-bold text-xs">Active</span>}
                        </td>
                        <td className="p-3 text-right font-medium text-slate-900">{e.hours.toFixed(2)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-400 italic">No entries logged for this week.</div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}