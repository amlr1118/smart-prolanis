import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface JadwalKegiatan {
  id: number;
  name: string;
  nama_kegiatan: string;
  jenis_kegiatan: string;
  tanggal: string;
  lokasi: string;
  status: string;
  is_active: boolean; // Nilai boolean
}

export default function AbsenPesertaProlanis() {
  const [jadwal, setJadwal] = useState<JadwalKegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getJadwal();
  }, []);

  const getJadwal = async () => {
    try {
      const response = await api.get("/jadwal-kegiatan-aktif");
      setJadwal(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (item: JadwalKegiatan) => {
    // Navigasi jika sudah aktif
    if (item.status === "1") {
      // 1. Ubah angka ID menjadi string
      const stringId = item.id.toString();
      
      // 2. Enkripsi (Samarkan) dengan Base64 menggunakan fungsi bawaan btoa()
      const encryptedId = btoa(stringId); 
      
      //console.log("Navigasi ke halaman absen untuk Encrypted ID:", encryptedId);
      
      // 3. Gunakan ID yang sudah dienkripsi di URL
      navigate(`/absen/${encryptedId}`);
      return;
    }

    Swal.fire({
      title: "Mulai Kegiatan?",
      text: `Anda yakin ingin memulai kegiatan "${item.nama_kegiatan}"? `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Mulai!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/update-status-kegiatan/${item.id}`, {
            status: "1",
            is_active: true, // Kirim parameter is_active ke backend
          });

          Swal.fire(
            "Berhasil!",
            "Kegiatan telah dimulai. Silakan lakukan absensi peserta.",
            "success"
          );

          getJadwal();
        } catch (error) {
          console.error(error);
          Swal.fire("Gagal!", "Terjadi kesalahan saat memulai kegiatan.", "error");
        }
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Jadwal Kegiatan
          </h3>
        </div>
      </div>
      
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama Kegiatan</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Jenis Kegiatan</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tanggal</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Lokasi</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Aksi</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="py-4 text-center" >Loading...</TableCell>
              </TableRow>
            ) : jadwal.length === 0 ? (
              <TableRow>
                <TableCell className="py-4 text-center">Belum ada jadwal kegiatan.</TableCell>
              </TableRow>
            ) : (
              jadwal.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{item.nama_kegiatan}</TableCell>
                  <TableCell className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{item.jenis_kegiatan}</TableCell>
                  <TableCell className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{item.tanggal}</TableCell>
                  <TableCell className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{item.lokasi}</TableCell>
                  <TableCell className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    <Badge
                      size="sm"
                      color={
                        item.status === "0" ? "warning" : item.status === "1" ? "success" : "error"
                      }
                    >
                      {item.status === "0" ? "Belum Dimulai" : item.status === "1" ? "Sedang Berlangsung" : "Selesai"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {item.status === "2" ? (
                      <span className="text-sm text-gray-400 italic">Selesai</span>
                    ) : (
                      <button
                        onClick={() => handleAction(item)}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${
                          item.is_active || item.status === "1"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {item.status === "1" ? "Absen Peserta" : "Mulai Kegiatan"}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}