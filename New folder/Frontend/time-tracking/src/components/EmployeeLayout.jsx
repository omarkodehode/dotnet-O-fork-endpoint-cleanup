import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";

export default function EmployeeLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-8">
          <Link to="/employee/dashboard" className="text-xl font-bold tracking-tight text-slate-900">
            Time<span className="text-blue-600">Track</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link to="/employee/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/employee/absences" className="hover:text-blue-600 transition-colors">Absences</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user?.username || "Employee"}</p>
            <p className="text-xs text-slate-500">Logged in</p>
          </div>
          <button 
            onClick={logout} 
            className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}