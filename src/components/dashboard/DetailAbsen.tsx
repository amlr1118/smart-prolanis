import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Swal from "sweetalert2";

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
  // Memperbolehkan tipe boolean atau number (karena MySQL mengembalikan 0/1)
  relasike_absen: { status_kehadiran: boolean | number }[];
}

export default function DetailAbsen() {
  const { kegiatanId } = useParams();
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
      const realId = atob(kegiatanId as string);
      const response = await api.get(`/get-peserta-absensi/${realId}`);
      setJadwal(response.data.jadwal);
      setPeserta(response.data.data_peserta);
      // console.log("Cek Data Peserta dari API:", response.data.data_peserta);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data absensi", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengakhiri kegiatan
  const handleSelesaiKegiatan = () => {
    Swal.fire({
      title: "Akhiri Kegiatan?",
      text: "Apakah Anda yakin ingin menutup kegiatan ini? Setelah ditutup, status akan menjadi 'Selesai'.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981", // Warna hijau
      cancelButtonColor: "#ef4444", // Warna merah
      confirmButtonText: "Ya, Tutup Kegiatan",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const realId = atob(kegiatanId as string);

          // Menggunakan endpoint update-status-kegiatan yang sudah kita buat di awal
          await api.put(`/update-status-kegiatan/${realId}`, {
            status: "2", // 2 = Selesai
            is_active: false, // Matikan kegiatan agar jadwal lain bisa dibuka
          });

          Swal.fire(
            "Berhasil!",
            "Kegiatan telah selesai dan ditutup.",
            "success",
          );

          // Kembalikan perawat ke halaman daftar jadwal
          navigate("/jadwal-kegiatan");
        } catch (error) {
          console.error("Gagal menutup kegiatan", error);
          Swal.fire(
            "Gagal",
            "Terjadi kesalahan saat menutup kegiatan.",
            "error",
          );
        }
      }
    });
  };

  const handleToggleKehadiran = async (
    pesertaId: number,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus;

    try {
      const realId = atob(kegiatanId as string);

      // PERBAIKAN: Kirim format integer (1 atau 0) yang lebih aman untuk tipe TINYINT MySQL
      await api.post("/upsert-absensi", {
        kegiatanid: parseInt(realId),
        pesertaid: pesertaId,
        status_kehadiran: newStatus ? 1 : 0,
      });

      setPeserta((prevPeserta) =>
        prevPeserta.map((p) => {
          if (p.id === pesertaId) {
            return {
              ...p,
              relasike_absen: [{ status_kehadiran: newStatus }],
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

  const filteredPeserta = peserta.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.no_bpjs.includes(search),
  );

  return (
    <div className="space-y-6">
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

          {/* Kelompok Tombol Aksi */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/jadwal-kegiatan")}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>

            {/* Tombol Baru untuk Selesaikan Kegiatan */}
            <button
              onClick={handleSelesaiKegiatan}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Selesaikan Kegiatan
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <input
          type="text"
          placeholder="🔍 Cari nama peserta atau ketik Nomor BPJS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-5 py-4 text-lg text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

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
                  const dataAbsensi = p.relasike_absen || [];

                  // PERBAIKAN: Konversi ketat (Strict Cast) untuk menangani angka 1/0 dari database
                  const isHadir =
                    dataAbsensi.length > 0
                      ? dataAbsensi[0].status_kehadiran === true ||
                        Number(dataAbsensi[0].status_kehadiran) === 1
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
                        <button
                          onClick={() => handleToggleKehadiran(p.id, isHadir)}
                          className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-200 ${
                            isHadir
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-500"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent"
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
