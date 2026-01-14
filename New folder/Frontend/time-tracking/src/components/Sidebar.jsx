import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userRole = user?.role?.toLowerCase();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const NavItem = ({ to, icon, label }) => {
    // Active if exact match OR starts with path (excluding generic dashboards)
    const isActive = location.pathname === to ||
      (location.pathname.startsWith(to) && to !== "/admin/dashboard" && to !== "/employee/dashboard" && to !== "/manager/dashboard");

    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group mb-1 ${isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 font-medium"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
      >
        <span className="text-lg opacity-80">{icon}</span>
        <span className="text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-30 border-r border-slate-800">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
          T
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">
          Time<span className="text-indigo-400">Track</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">

        {/* EMPLOYEES MENU */}
        {userRole === "employee" && (
          <div>
            <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">My Workspace</div>
            <NavItem to="/employee/dashboard" icon="📊" label="Dashboard" />
            <NavItem to="/employee/clock-in-out" icon="⏱" label="Time Clock" />
            <NavItem to="/employee/absences" icon="📅" label="My Absences" />
          </div>
        )}

        {/* MANAGER MENU (Visible to Manager & Admin) */}
        {(userRole === "manager" || userRole === "admin") && (
          <div>
            <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Management</div>
            <NavItem to="/admin/employees" icon="👥" label="Employees" />
            <NavItem to="/admin/departments" icon="🏢" label="Departments" />
            <NavItem to="/admin/absences" icon="📅" label="All Absences" />
          </div>
        )}

        {/* ADMIN MENU */}
        {userRole === "admin" && (
          <div>
            <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Panel</div>
            <NavItem to="/admin/dashboard" icon="📊" label="Overview" />
            <NavItem to="/admin/payroll" icon="💰" label="Payroll" />
            <NavItem to="/admin/logs" icon="📜" label="System Logs" />
          </div>
        )}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-sm text-white truncate">{user?.username || "User"}</p>
            <p className="text-xs text-slate-500 capitalize truncate">{user?.role || "Guest"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2 rounded-lg text-xs font-medium transition-colors border border-slate-700"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}