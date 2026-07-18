import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Pastikan import dari react-router-dom
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import PesertaProlanisPages from "./pages/MasterData/PesertaProlanisPages";
import PenggunaComponent from "./components/master-data/PenggunaComponent";
import JadwalKegiatanComponent from "./components/master-data/JadwalKegiatanComponent";
import DetailAbsen from "./components/dashboard/DetailAbsen";
import ArsipKegiatan from "./components/arsip/ArsipKegiatanComponent";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

import PrivateRoute from "./components/route/PrivateRoutes";
import PublicRoute from "./components/route/PublicRoutes";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Rute Global (Semua yang login bisa akses) */}
            <Route
              index
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />

            {/* RUTE TERBATAS: Hanya Administrasi (5) dan PIC (6) yang bisa Kelola Pengguna */}
            <Route
              path="/data-pengguna"
              element={
                <PrivateRoute allowedRoles={[6]}>
                  <PenggunaComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/peserta-prolanis"
              element={
                <PrivateRoute allowedRoles={[5, 6]}>
                  <PesertaProlanisPages />
                </PrivateRoute>
              }
            />

            <Route
              path="/jadwal-kegiatan"
              element={
                <PrivateRoute allowedRoles={[5, 6]}>
                  <JadwalKegiatanComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/absen/:kegiatanId"
              element={
                <PrivateRoute allowedRoles={[5, 6]}>
                  <DetailAbsen />
                </PrivateRoute>
              }
            />

            <Route
              path="/arsip-kegiatan"
              element={
                <PrivateRoute allowedRoles={[5, 6]}>
                  <ArsipKegiatan />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Login Route (Public) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
