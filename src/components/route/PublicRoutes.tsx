import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();

  // Jika sudah ada token (sedang login), jangan izinkan ke halaman login lagi
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
