import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import PatientDashboard    from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientJournals     from "./pages/patient/PatientJournals";

import DoctorDashboard    from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors   from "./pages/admin/AdminDoctors";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public routes — no Layout, no auth needed */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Navigate to="/login" replace />} />

          {/* Patient routes */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientAppointments />
            </ProtectedRoute>
          } />
          <Route path="/patient/journals" element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientJournals />
            </ProtectedRoute>
          } />

          {/* Doctor routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAppointments />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDoctors />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}