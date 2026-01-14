import { useEffect, useState } from "react";
import dashboardApi from "../../api/dashboardApi";
import adminTimeApi from "../../api/adminTimeApi";

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    totalEmployees: 0, 
    activeEmployees: 0, 
    absencesToday: 0,
    weeklyStats: { planned: 0, registered: 0 } 
  });
  const [activeShifts, setActiveShifts] = useState([]);

  useEffect(() => {
    dashboardApi.getStats().then((res) => setStats(res.data)).catch(console.error);
    adminTimeApi.getActiveShifts().then((res) => setActiveShifts(res.data)).catch(console.error);
  }, []);

  const handleExport = async () => {
    const month = prompt("Enter month number (1-12):", new Date().getMonth() + 1);
    if (!month) return;
    try {
        const res = await adminTimeApi.exportGlobalPayroll(new Date().getFullYear(), month);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `global-payroll-${new Date().getFullYear()}-${month}.csv`);
        document.body.appendChild(link);
        link.click();
    } catch (err) { alert("Export failed."); }
  };

  const StatCard = ({ title, value, subtext, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color}`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
          <span className={`p-2 rounded-lg ${color} bg-opacity-10 text-xl`}>{icon}</span>
        </div>
        <span className="text-4xl font-bold text-slate-900">{value ?? 0}</span>
        {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        {/* ✅ NEW: Export Button */}
        <button onClick={handleExport} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20">
            <span>📥</span> Download Global Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Staff" value={stats.totalEmployees} icon="👥" color="bg-indigo-500 text-indigo-600" />
        <StatCard title="Active Now" value={stats.activeEmployees} icon="⏱" color="bg-emerald-500 text-emerald-600" />
        <StatCard title="Absent Today" value={stats.absencesToday} icon="🤒" color="bg-rose-500 text-rose-600" />
       
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Live Attendance</h3>
        {activeShifts.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No employees are currently clocked in.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <th className="py-3">Employee</th>
                <th className="py-3">Clock In</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeShifts.map((shift) => (
                <tr key={shift.id}>
                  <td className="py-4 font-medium text-slate-900">{shift.employeeName}</td>
                  <td className="py-4 text-slate-600">
                    {new Date(shift.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 text-emerald-600 font-medium">Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}