import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import PesertaProlanisPages from "./pages/MasterData/PesertaProlanisPages";
import PenggunaComponent from "./components/master-data/PenggunaComponent";
import JadwalKegiatanComponent from "./components/master-data/JadwalKegiatanComponent";
import DetailAbsen from "./components/dashboard/DetailAbsen";
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
            <Route
              index
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/data-pengguna"
              element={
                <PrivateRoute>
                  <PenggunaComponent />
                </PrivateRoute>
              }
            />
            <Route
              path="/peserta-prolanis"
              element={
                <PrivateRoute>
                  <PesertaProlanisPages />
                </PrivateRoute>
              }
            />

            <Route
              path="/jadwal-kegiatan"
              element={
                <PrivateRoute>
                  <JadwalKegiatanComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/absen/:kegiatanId"
              element={
                <PrivateRoute>
                  <DetailAbsen />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Login */}
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
