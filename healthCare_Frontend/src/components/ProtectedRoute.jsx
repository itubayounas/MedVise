import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuth, role } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    const map = { patient: "/patient", doctor: "/doctor", admin: "/admin" };
    return <Navigate to={map[role] || "/login"} replace />;
  }
  return children;
}