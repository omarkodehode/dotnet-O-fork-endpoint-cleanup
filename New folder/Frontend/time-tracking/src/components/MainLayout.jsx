import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Retrieve the user/role from storage (or Context)
  // Ensure your Login page saves this structure to localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role; 

  // 2. Define menu items based on Role
  const adminLinks = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Employees", path: "/admin/employees", icon: "👥" },
    { label: "Absences", path: "/admin/absences", icon: "📅" },
    { label: "System Logs", path: "/admin/logs", icon: "📜" },
    { label: "Department", path: "/admin/departments", icon: "🏢" },
     // ✅ Only for Admin
  ];

  const employeeLinks = [
    { label: "Dashboard", path: "/employee/dashboard", icon: "🏠" },
    { label: "Clock In/Out", path: "/employee/clock-in-out", icon: "⏱️" },
    { label: "My Absences", path: "/employee/absences", icon: "📅" },
  ];

  // Select the correct list based on the role
  const linksToRender = role === "admin" ? adminLinks : employeeLinks;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">HR System</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome, {user.name || role}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {linksToRender.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname.startsWith(link.path)
                  ? "bg-blue-50 text-blue-600 font-medium" // Active State
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Shared Bottom Links (e.g., Change Password & Logout) */}
        <div className="p-4 border-t space-y-2">
          <Link
            to="/change-password"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/change-password"
                 ? "bg-blue-50 text-blue-600" 
                 : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>🔒</span> Change Password
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 overflow-auto p-8">
        {/* The <Outlet /> renders the child route (e.g., Dashboard, Logs, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}