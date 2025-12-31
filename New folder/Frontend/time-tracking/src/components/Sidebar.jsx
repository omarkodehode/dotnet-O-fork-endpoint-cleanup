import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const NavItem = ({ to, icon, label }) => {
    // Check if this link is currently active
    const isActive = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mb-1 ${
          isActive 
            ? "bg-primary-600 text-white shadow-md shadow-primary-900/20" 
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <span className="text-xl">{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-30 border-r border-slate-800">
      <div className="p-6 flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Time<span className="text-primary-500">Track</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Overview</div>
        <NavItem to="/admin/dashboard" icon="📊" label="Dashboard" />
        
        <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Management</div>
        <NavItem to="/admin/employees" icon="👥" label="Employees" />
        <NavItem to="/admin/absences" icon="📅" label="Absences" />
        <NavItem to="/admin/time-entries" icon="⏱" label="Time Entries" />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-xs font-bold">AD</div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm text-white truncate">Administrator</p>
            <p className="text-xs text-slate-500 truncate">admin@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}