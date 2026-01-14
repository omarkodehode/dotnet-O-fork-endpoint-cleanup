import { useEffect, useState } from "react";
import api from "../../api/apiClient";

export default function EmployeeDashboard() {
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchHistory();
    fetchBalance();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/employee/history");
      setHistory(res.data);
    } catch (err) { console.error("Failed to load history"); }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get("/api/employee/flex-balance");
      setBalance(res.data.flexHours);
    } catch (err) { console.error("Failed to load balance"); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-bold uppercase mb-2">Flex Balance</h3>
          <p className={`text-4xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {balance > 0 ? '+' : ''}{balance}h
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Clock In</th>
              <th className="p-4">Clock Out</th>
              <th className="p-4">Duration</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                {/* ✅ FIX: Using clockIn / clockOut */}
                <td className="p-4 font-medium text-slate-700">
                  {new Date(t.clockIn).toLocaleDateString()}
                </td>
                <td className="p-4 text-slate-500">
                  {new Date(t.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4 text-slate-500">
                  {t.clockOut
                    ? new Date(t.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : <span className="text-emerald-600 font-bold text-xs">ACTIVE</span>}
                </td>
                <td className="p-4 font-mono text-sm">
                  {t.duration ? t.duration.toFixed(2) + 'h' : '-'}
                </td>
                <td className="p-4 text-right">
                  {t.isApproved
                    ? <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold border border-emerald-100">LOCKED</span>
                    : <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">OPEN</span>}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No time entries recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}