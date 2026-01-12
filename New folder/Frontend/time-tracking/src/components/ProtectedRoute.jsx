import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  
  const userStr = localStorage.getItem("user");
  let userRole = null;
  
  try {
    if (userStr) {
      const user = JSON.parse(userStr);
      userRole = user.role; 
    }
  } catch (e) {
    console.error("Auth Error:", e);
    localStorage.removeItem("user");
  }

  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}