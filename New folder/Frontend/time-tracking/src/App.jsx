import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
import CreateEmployee from "./pages/admin/CreateEmployee";
import EditEmployee from "./pages/admin/EditEmployee";
import Absences from "./pages/admin/Absences";
import CreateAbsence from "./pages/admin/CreateAbsence";
import EditAbsence from "./pages/admin/EditAbsence";
import Logs from "./pages/admin/Logs";
import Departments from "./pages/admin/Departments";
import Payroll from "./pages/admin/Payroll"; // ✅ NEW

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeAbsences from "./pages/employee/Absences";
import ClockInOut from "./pages/employee/ClockInOut";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard"; // ✅ NEW

// Shared Pages
import ChangePassword from "./pages/ChangePassword";

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

      {/* ---------------- SHARED MANAGER & ADMIN ROUTES ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}>
        <Route element={<MainLayout />}>

          {/* Manager Dashboard */}

          <Route path="/manager" element={<ManagerDashboard />} /> 
                    <Route path="/admin/employees" element={<Employees />} />
<Route path="/manager/absences" element={<Absences />} />
          <Route path="/manager/absences/create" element={<CreateAbsence />} />
          <Route path="/manager/absences/edit/:id" element={<EditAbsence />} />
           <Route path="/manager/payroll" element={<Payroll />} />

          {/* Shared Management Pages */}
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/employees/edit/:id" element={<EditEmployee />} />

          <Route path="/admin/departments" element={<Departments />} />

          <Route path="/admin/absences" element={<Absences />} />
          <Route path="/admin/absences/create" element={<CreateAbsence />} />
          <Route path="/admin/absences/edit/:id" element={<EditAbsence />} />
           <Route path="/admin/payroll" element={<Payroll />} />
        </Route>
      </Route>

      {/* ---------------- ADMIN ONLY ROUTES ---------------- */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />

          {/* Restricted: Create Employee, Logs, Payroll */}
          <Route path="/admin/employees/new" element={<CreateEmployee />} />
          <Route path="/admin/logs" element={<Logs />} />
          {/* ✅ NEW */}
        </Route>
      </Route>

      {/* ---------------- SHARED ROUTES ---------------- */}
      {/* ✅ UPDATED: Added "manager" to allowed roles */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "employee", "manager"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}