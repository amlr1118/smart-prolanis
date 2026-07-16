import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useParams untuk menangkap ID di URL
import api from "../../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Swal from "sweetalert2";

// --- Type Interfaces ---
interface JadwalInfo {
  id: number;
  nama_kegiatan: string;
  tanggal: string;
  lokasi: string;
}

interface Peserta {
  id: number;
  nama: string;
  no_bpjs: string;
  diagnosa: string;
  // Karena kita pakai Eager Loading with() di Laravel, relasi absensi akan muncul sebagai array
  absensi: { status_kehadiran: boolean }[];
}

export default function DetailAbsen() {
  const { kegiatanId } = useParams(); // Menangkap ID dari URL (/absen/1)
  const navigate = useNavigate();

  const [jadwal, setJadwal] = useState<JadwalInfo | null>(null);
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (kegiatanId) {
      fetchData();
    }
  }, [kegiatanId]);

  const fetchData = async () => {
    try {
      // Memanggil endpoint getPesertaAbsensi yang sudah dibuat di controller Laravel
      const realId = atob(kegiatanId as string);
      const response = await api.get(`/get-peserta-absensi/${realId}`);
      setJadwal(response.data.jadwal);
      setPeserta(response.data.data_peserta);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data absensi", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi saat toggle ditekan (Langsung hit API Upsert)
  const handleToggleKehadiran = async (
    pesertaId: number,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus; // Balikkan status (Hadir -> Alpa, atau sebaliknya)

    try {
      const realId = atob(kegiatanId as string);
      await api.post("/upsert-absensi", {
        kegiatanid: realId,
        pesertaid: pesertaId,
        status_kehadiran: newStatus,
      });

      // Update state lokal agar UI langsung berubah tanpa perlu loading ulang seluruh halaman
      setPeserta((prevPeserta) =>
        prevPeserta.map((p) => {
          if (p.id === pesertaId) {
            return {
              ...p,
              absensi: [{ status_kehadiran: newStatus }],
            };
          }
          return p;
        }),
      );
    } catch (error) {
      console.error("Gagal update absensi", error);
      Swal.fire("Gagal", "Koneksi terputus, gagal menyimpan data.", "error");
    }
  };

  // Filter fitur pencarian
  const filteredPeserta = peserta.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.no_bpjs.includes(search),
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Informasi Kegiatan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              📋 Absensi: {jadwal?.nama_kegiatan || "Memuat..."}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tanggal: {jadwal?.tanggal} | Lokasi: {jadwal?.lokasi}
            </p>
          </div>
          <button
            onClick={() => navigate("/jadwal-kegiatan")}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Kembali ke Jadwal
          </button>
        </div>
      </div>

      {/* 2. Area Pencarian */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="🔍 Cari nama peserta atau ketik/scan Nomor BPJS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-5 py-4 text-lg text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* 3. Tabel Peserta */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 text-start">
                  Profil Pasien
                </TableCell>
                <TableCell isHeader className="py-3 text-start">
                  Diagnosa
                </TableCell>
                <TableCell isHeader className="py-3 text-center">
                  Status Kehadiran
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow>
                  <TableCell className="text-center py-4">
                    Memuat data peserta...
                  </TableCell>
                </TableRow>
              ) : filteredPeserta.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-4">
                    Peserta tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPeserta.map((p) => {
                  // Cek apakah data absen sudah ada di array (index 0)
                  const dataAbsensi = p.absensi || [];
                  const isHadir =
                    dataAbsensi.length > 0
                      ? dataAbsensi[0].status_kehadiran
                      : false;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 dark:text-white/90 text-base">
                            {p.nama}
                          </span>
                          <span className="text-sm text-gray-500">
                            BPJS: {p.no_bpjs}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {p.diagnosa}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {/* Tombol Toggle Aksi Satu Klik */}
                        <button
                          onClick={() => handleToggleKehadiran(p.id, isHadir)}
                          className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-200 ${
                            isHadir
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-500" // Mode Hadir (ON)
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent" // Mode Alpa (OFF)
                          }`}
                        >
                          {isHadir ? "✓ HADIR" : "✗ ALPA"}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
