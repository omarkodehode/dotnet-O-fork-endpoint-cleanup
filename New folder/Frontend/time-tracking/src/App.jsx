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
import Payroll from "./pages/admin/Payroll";

// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeAbsences from "./pages/employee/Absences";
import ClockInOut from "./pages/employee/ClockInOut";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard"; 
import ManagerApprovals from "./pages/manager/ManagerApprovals";
import ManagerTeam from "./pages/manager/ManagerTeam";
import ManagerRecordAbsence from "./pages/manager/ManagerRecordAbsence";
import ManagerPayroll from "./pages/manager/ManagerPayroll"; // ✅ NEW

// Shared
import ChangePassword from "./pages/ChangePassword";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* EMPLOYEE ONLY */}
      <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        </Route>
      </Route>

      {/* SHARED: EMPLOYEE & MANAGER (Clock In, Personal Absences) */}
      <Route element={<ProtectedRoute allowedRoles={["employee", "manager"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/employee/clock-in-out" element={<ClockInOut />} />
          <Route path="/employee/absences" element={<EmployeeAbsences />} />
        </Route>
      </Route>

      {/* MANAGER ONLY */}
      <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/approvals" element={<ManagerApprovals />} />
          <Route path="/manager/team" element={<ManagerTeam />} />
          <Route path="/manager/record-absence" element={<ManagerRecordAbsence />} />
          {/* ✅ New Payroll Route */}
          <Route path="/manager/payroll" element={<ManagerPayroll />} />
        </Route>
      </Route>

      {/* ADMIN & MANAGER SHARED */}
      <Route element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/employees/edit/:id" element={<EditEmployee />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/absences" element={<Absences />} />
          <Route path="/admin/payroll" element={<Payroll />} />
        </Route>
      </Route>

      {/* ADMIN ONLY */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/employees/new" element={<CreateEmployee />} />
          <Route path="/admin/absences/create" element={<CreateAbsence />} />
          <Route path="/admin/absences/edit/:id" element={<EditAbsence />} />
          <Route path="/admin/logs" element={<Logs />} />
        </Route>
      </Route>

      {/* SHARED ALL */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "employee", "manager"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}