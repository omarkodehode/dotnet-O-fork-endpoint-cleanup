import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout"; 

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
import EditEmployee from "./pages/admin/EditEmployee"; // ✅ Added Import
import Absences from "./pages/admin/Absences";
import CreateAbsence from "./pages/admin/CreateAbsence"; // ✅ Added Import
import EditAbsence from "./pages/admin/EditAbsence";     // ✅ Added Import

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeAbsences from "./pages/employee/Absences";
import ClockInOut from "./pages/employee/ClockInOut";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* ---------------- EMPLOYEE ROUTES ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/clock-in-out" element={<ClockInOut />} />
          <Route path="/employee/absences" element={<EmployeeAbsences />} />
        </Route>
      </Route>

      {/* ---------------- ADMIN ROUTES ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          
          {/* Employees Management */}
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/employees/edit/:id" element={<EditEmployee />} /> {/* ✅ Added Route */}

          {/* Absences Management */}
          <Route path="/admin/absences" element={<Absences />} />
          <Route path="/admin/absences/create" element={<CreateAbsence />} />   {/* ✅ Added Route */}
          <Route path="/admin/absences/edit/:id" element={<EditAbsence />} />   {/* ✅ Added Route */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}