import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Imports
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
// import Absences from "./pages/admin/Absences"; // Uncomment when you have this file

// Employee Imports
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeAbsences from "./pages/employee/Absences";
import ClockInOut from "./pages/employee/ClockInOut";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* ---------------- EMPLOYEE ROUTES ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/absences" element={<EmployeeAbsences />} />
        <Route path="/employee/clock-in-out" element={<ClockInOut />} />
      </Route>

      {/* ---------------- ADMIN ROUTES ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* The "index" route loads when you go to /admin/ */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          {/* <Route path="absences" element={<Absences />} /> */}
        </Route>
      </Route>

      {/* Catch-all: Redirect unknown URLs to Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}