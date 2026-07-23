
import AbsemPesrtaProlanis from "../../components/dashboard/AbsenPesertaProlanis";
import KaderWidget from "../../components/widget/KaderWidget";
import PemeriksaanComponent from "../../components/dashboard/PemeriksaaanComponent";
import PemeriksaanDokterComponent from "../../components/dashboard/PemeriksaanDokterComponent";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  // 2. Ambil data user yang sedang login
  const { user } = useAuth();

  // 3. Fungsi helper untuk mengecek hak akses (PIC Prolanis otomatis True)
  const hasAccess = (allowedRoles: number[]) => {
    if (!user) return false;
    if (user.role === 6) return true; // 6 = PIC Prolanis / Superadmin
    return allowedRoles.includes(user.role);
  };
  return (
    <>
      <PageMeta
        title="Dashboard | Smart-PROLANIS"
        description="Dashboard utama sistem Smart-PROLANIS"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {hasAccess([5]) && (
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <KaderWidget />
          </div>
        )}

        {/* WIDGET 2: Absensi Peserta Prolanis */}
        {/* Contoh: Hanya tampil untuk Dokter (1) dan Perawat (2) */}
        {hasAccess([5]) && (
          <div className="col-span-12">
            <AbsemPesrtaProlanis />
          </div>
        )}

        {/* {hasAccess([2]) && (
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <PemeriksaanWidget />
          </div>
        )} */}

        {hasAccess([2]) && (
          <div className="col-span-12">
            <PemeriksaanComponent />
          </div>
        )}

        {hasAccess([1]) && (
          <div className="col-span-12">
            <PemeriksaanDokterComponent />
          </div>
        )}

      </div>
    </>
  );
}
