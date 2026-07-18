import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[]; // Array role yang boleh mengakses
}

export default function PrivateRoute({
  children,
  allowedRoles,
}: PrivateRouteProps) {
  const { token, user } = useAuth();

  // 1. Cek apakah user sudah login (punya token)
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Jika rute ini dibatasi untuk role tertentu, cek kecocokannya
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Pengecualian: PIC Prolanis (6) selalu diizinkan mengakses semua menu
    if (user.role !== 6) {
      // Jika tidak punya akses, lempar kembali ke Dashboard utama
      return <Navigate to="/" replace />;
    }
  }

  // 3. Jika lolos semua pengecekan, render komponennya
  return <>{children}</>;
}
