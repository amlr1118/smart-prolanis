import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: number[]; // Array role yang diizinkan (misal: [1, 2, 6])
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { token, user } = useAuth();

  // 1. Jika tidak ada token (belum login), tendang ke halaman /login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Jika route ini butuh role khusus, dan role user tidak ada di daftar
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // PIC Prolanis (6) selalu bisa mengakses semuanya
    if (user.role !== 6) {
      // Tendang ke halaman unauthorized atau dashboard
      return <Navigate to="/" replace />;
    }
  }

  // 3. Jika aman, izinkan masuk ke komponen/halaman yang dituju
  return <Outlet />;
}
