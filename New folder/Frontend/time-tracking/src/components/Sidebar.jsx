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
    // Check for active state
    // Exclude generic dashboard roots to prevent multiple active highlights
    const isActive = location.pathname === to || 
      (location.pathname.startsWith(to) && 
       to !== "/manager" && 
       to !== "/admin/dashboard" && 
       to !== "/employee/dashboard");

    return (
      <Link
        to={to}
        // ✅ OLD DESIGN STYLES: White bg, Blue active state, Gray text
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
          isActive
            ? "bg-blue-50 text-blue-600 font-medium" 
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <span className="text-xl">{icon}</span>
        <span className="text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col h-screen sticky top-0 border-r border-gray-200">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600">HR System</h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">
          Welcome, {user?.username || userRole}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

        {/* --- EMPLOYEE LINKS --- */}
        {userRole === "employee" && (
          <>
            <div className="px-4 mt-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Workspace</div>
            <NavItem to="/employee/dashboard" icon="🏠" label="Dashboard" />
            <NavItem to="/employee/clock-in-out" icon="⏱️" label="Time Clock" />
            <NavItem to="/employee/absences" icon="📅" label="My Absences" />
          </>
        )}

        {/* --- MANAGER LINKS (Fixed Logic) --- */}
        {userRole === "manager" && (
          <>
            <div className="px-4 mt-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Manager Panel</div>
            <NavItem to="/manager" icon="📊" label="Review Hours" />
            <NavItem to="/manager/approvals" icon="✅" label="Approve Absences" />
            <NavItem to="/manager/team" icon="👥" label="My Team" />
            <NavItem to="/manager/record-absence" icon="📝" label="Record Absence" />
            <NavItem to="/manager/payroll" icon="💰" label="Payroll Export" />

            <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Personal</div>
            <NavItem to="/employee/clock-in-out" icon="⏱️" label="Clock In/Out" />
            <NavItem to="/employee/absences" icon="📅" label="My Absences" />
          </>
        )}

        {/* --- ADMIN ONLY LINKS --- */}
        {userRole === "admin" && (
          <>
             <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">System</div>
             <NavItem to="/admin/dashboard" icon="📊" label="Overview" />
             <NavItem to="/admin/employees" icon="👥" label="All Employees" />
             <NavItem to="/admin/departments" icon="🏢" label="Departments" />
             <NavItem to="/admin/absences" icon="📅" label="All Absences" />
             <NavItem to="/admin/payroll" icon="💰" label="Payroll" />
             <NavItem to="/admin/logs" icon="📜" label="System Logs" />
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          to="/change-password"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            location.pathname === "/change-password"
               ? "bg-blue-50 text-blue-600" 
               : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>🔒</span> 
          <span className="text-sm">Change Password</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          <span>🚪</span> 
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}