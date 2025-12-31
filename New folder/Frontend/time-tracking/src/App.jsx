import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
import CreateEmployee from "./pages/admin/CreateEmployee";
import EditEmployee from "./pages/admin/EditEmployee";
import Absences from "./pages/admin/Absences";
import CreateAbsence from "./pages/admin/CreateAbsence";
import EditAbsence from "./pages/admin/EditAbsence";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AdminLayout from "./components/AdminLayout";

function RequireAuth({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Login page */}
      <Route path="/login" element={<Login />} />

      {/* Admin routes nested under AdminLayout */}
      <Route
        path="/admin/*"
        element={
          <RequireAuth role="admin">
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="employees/create" element={<CreateEmployee />} />
                <Route path="employees/edit/:id" element={<EditEmployee />} />
                <Route path="absences" element={<Absences />} />
                <Route path="absences/create" element={<CreateAbsence />} />
                <Route path="absences/edit/:id" element={<EditAbsence />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </RequireAuth>
        }
      />

      {/* Employee routes */}
      <Route
        path="/employee/dashboard"
        element={
          <RequireAuth role="employee">
            <EmployeeDashboard />
          </RequireAuth>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
