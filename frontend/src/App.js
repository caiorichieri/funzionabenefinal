import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const ADMIN_ROLES = ["admin"];
const THERAPIST_ROLES = ["terapeuta"];
const PATIENT_ROLES = ["paziente"];
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OTPPage from "@/pages/OTPPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TerapistiPage from "@/pages/admin/TerapistiPage";
import PazientiPage from "@/pages/admin/PazientiPage";
import AppuntamentiPage from "@/pages/admin/AppuntamentiPage";
import BlogPage from "@/pages/admin/BlogPage";
import TerapistaDashboard from "@/pages/therapist/TerapistaDashboard";
import TerapistaProfile from "@/pages/therapist/TerapistaProfile";
import TerapistaBlogPage from "@/pages/therapist/TerapistaBlogPage";
import PazienteDashboard from "@/pages/patient/PazienteDashboard";
import Layout from "@/components/shared/Layout";
import "@/App.css";

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (user === null) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin"/></div>;
  if (user === false) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (user === null) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin"/></div>;
  if (user === false) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "terapeuta") return <Navigate to="/terapeuta" replace />;
  return <Navigate to="/paziente" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrati" element={<RegisterPage />} />
          <Route path="/verifica-otp" element={<OTPPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={ADMIN_ROLES}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="terapisti" element={<TerapistiPage />} />
            <Route path="pazienti" element={<PazientiPage />} />
            <Route path="appuntamenti" element={<AppuntamentiPage />} />
            <Route path="blog" element={<BlogPage />} />
          </Route>

          {/* Therapist routes */}
          <Route path="/terapeuta" element={<ProtectedRoute roles={THERAPIST_ROLES}><Layout /></ProtectedRoute>}>
            <Route index element={<TerapistaDashboard />} />
            <Route path="profilo" element={<TerapistaProfile />} />
            <Route path="blog" element={<TerapistaBlogPage />} />
          </Route>

          {/* Patient routes */}
          <Route path="/paziente" element={<ProtectedRoute roles={PATIENT_ROLES}><Layout /></ProtectedRoute>}>
            <Route index element={<PazienteDashboard />} />
          </Route>

          <Route path="/register" element={<Navigate to="/registrati" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
