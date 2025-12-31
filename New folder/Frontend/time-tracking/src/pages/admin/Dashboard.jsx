import { useEffect, useState } from "react";
import dashboardApi from "../../api/dashboardApi";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalEmployees: 0, activeNow: 0, absentToday: 0 });

  useEffect(() => {
    // Mock data fallback if API fails
    dashboardApi.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats({ totalEmployees: 12, activeNow: 5, absentToday: 2 }));
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color} group-hover:scale-110 transition-transform`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
          <span className={`p-2 rounded-lg ${color} bg-opacity-10 text-xl`}>{icon}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-slate-900">{value}</span>
          <span className="text-sm text-slate-400 font-medium">Recorded</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon="👥" color="bg-indigo-500 text-indigo-600" />
        <StatCard title="Active Shifts" value={stats.activeNow} icon="⏱" color="bg-emerald-500 text-emerald-600" />
        <StatCard title="Absent Today" value={stats.absentToday} icon="🤒" color="bg-rose-500 text-rose-600" />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
        </div>
        <div className="border-2 border-dashed border-slate-100 rounded-xl h-48 flex items-center justify-center text-slate-400 bg-slate-50">
          <p>Chart / Activity Feed Placeholder</p>
        </div>
      </div>
    </div>
  );
}