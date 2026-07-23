import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import PageMeta from "../common/PageMeta";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useAuth } from "../../context/AuthContext";
import PemeriksaanWidget from "../widget/PemeriksaanWidget";

// 1. TAMBAH JENIS KELAMIN DI INTERFACE
interface Peserta {
  id: number;
  nama: string;
  no_bpjs: string;
  jenis_kelamin: string;
  usia: number;
  status_diperiksa: boolean;
  data_ttv?: any;
}

interface JadwalInfo {
  nama_kegiatan: string;
  tanggal: string;
  lokasi: string;
}

export default function PemeriksaanFisikComponent() {
  const { user } = useAuth();

  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);

  // State loading sudah ada, kita akan manfaatkan untuk UI
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeKegiatanId, setActiveKegiatanId] = useState<number | null>(null);
  const [isNoActiveSchedule, setIsNoActiveSchedule] = useState(false);
  const [jadwalInfo, setJadwalInfo] = useState<JadwalInfo | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TAMBAHAN: State untuk memicu refresh widget
  const [refreshWidget, setRefreshWidget] = useState(0);

  const [formData, setFormData] = useState({
    berat_badan: "",
    tinggi_badan: "",
    tensi_sistolik: "",
    tensi_diastolik: "",
    gula_darah_puasa: "",
    aktivitas: "",
  });

  const [errors, setErrors] = useState<any>({});

  // Tambahkan parameter isBackground dengan default false
  const fetchPesertaAktif = async (isBackground = false) => {
    // Hanya nyalakan loading jika BUKAN dari auto-refresh background
    if (!isBackground) {
      setLoading(true);
    }
    
    setIsNoActiveSchedule(false);
    
    try {
      const res = await api.get(`/pemeriksaan-fisik/peserta-hadir`);
      setPesertaList(res.data.data);
      setActiveKegiatanId(res.data.kegiatan_id);

      if (res.data.detail_jadwal) {
        setJadwalInfo(res.data.detail_jadwal);
      }

      // Jika ini adalah auto-refresh, trigger juga update pada widget
      if (isBackground) {
        setRefreshWidget(prev => prev + 1);
      }

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setIsNoActiveSchedule(true);
        setPesertaList([]);
      } else if (!isBackground) {
        // Jangan tampilkan alert error terus-menerus jika background fetch gagal
        Swal.fire("Error", "Gagal memuat daftar peserta.", "error");
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // 1. Fetch data pertama kali saat halaman dibuka (akan memunculkan loading)
    fetchPesertaAktif();

    // 2. Buat interval auto-refresh setiap 15 detik (15000 milidetik)
    const interval = setInterval(() => {
      fetchPesertaAktif(true); // true = isBackground aktif (tanpa loading)
    }, 15000);

    // 3. Bersihkan interval jika perawat pindah ke halaman lain
    return () => clearInterval(interval);
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPeserta = pesertaList.filter((peserta) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      peserta.nama.toLowerCase().includes(searchLower) ||
      peserta.no_bpjs.includes(searchLower)
    );
  });

  const openModal = (peserta: Peserta) => {
    setSelectedPeserta(peserta);
    setErrors({});
    if (peserta.status_diperiksa && peserta.data_ttv) {
      setFormData({
        berat_badan: peserta.data_ttv.berat_badan || "",
        tinggi_badan: peserta.data_ttv.tinggi_badan || "",
        tensi_sistolik: peserta.data_ttv.tensi_sistolik || "",
        tensi_diastolik: peserta.data_ttv.tensi_diastolik || "",
        gula_darah_puasa: peserta.data_ttv.gula_darah_puasa || "",
        aktivitas: peserta.data_ttv.aktivitas || "",
      });
    } else {
      setFormData({
        berat_badan: "",
        tinggi_badan: "",
        tensi_sistolik: "",
        tensi_diastolik: "",
        gula_darah_puasa: "",
        aktivitas: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPeserta(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PERHATIKAN TANDA TANYA (?) SETELAH HURUF e
  const handleSubmit = async (e?: React.FormEvent) => {
    // Tambahkan if(e) untuk mencegah error jika dipanggil tanpa event
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setErrors({}); // <--- Hapus pesan error sebelumnya setiap kali tombol simpan ditekan

    try {
      await api.post("/upsert-pemeriksaan", {
        jadwal_kegiatan_id: activeKegiatanId,
        pesertaid: selectedPeserta?.id,
        ...formData,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data TTV ${selectedPeserta?.nama} berhasil disimpan.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setPesertaList((prev) =>
        prev.map((p) =>
          p.id === selectedPeserta?.id
            ? { ...p, status_diperiksa: true, data_ttv: formData }
            : p,
        ),
      );

      // TAMBAHAN: Ubah angka trigger untuk menyuruh Widget fetch data baru
      setRefreshWidget((prev) => prev + 1);
      closeModal();
    } catch (error: any) {
      // TAMBAHAN: Tangkap error 422 dari Laravel
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isNoActiveSchedule && !loading) {
    return (
      <>
        <PageMeta
          title="Pemeriksaan Fisik"
          description="Input Pemeriksaan Peserta"
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-warning-100 p-4 mb-4 dark:bg-warning-500/20">
            <svg
              className="w-12 h-12 text-warning-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-title-md2 font-semibold text-gray-800 dark:text-white/90">
            Tidak Ada Jadwal Aktif
          </h2>
          <p className="text-gray-500 mt-2">
            Belum ada jadwal kegiatan prolanis yang berstatus aktif hari ini.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {!loading && <PemeriksaanWidget refreshTrigger={refreshWidget} />}

      <div className="space-y-6">
{/*        
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4 dark:bg-gray-700"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </div>
        ) : jadwalInfo ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Informasi Pemeriksaan
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Kegiatan
                </p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {jadwalInfo.nama_kegiatan}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tanggal
                </p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {jadwalInfo.tanggal}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Lokasi
                </p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {jadwalInfo.lokasi}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Petugas Pemeriksa
                </p>
                <p className="font-medium text-brand-500">
                  {user?.name || "Perawat"}
                </p>
              </div>
            </div>
          </div>
        ) : null} */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title-md2 font-semibold text-gray-800 dark:text-white/90">
              Daftar Peserta Hadir
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari nama atau BPJS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 font-medium">No. BPJS</th>
                  <th className="px-4 py-3 font-medium">Nama Peserta</th>
                  <th className="px-4 py-3 font-medium">Jenis Kelamin</th>
                  <th className="px-4 py-3 font-medium">Usia</th>
                  <th className="px-4 py-3 font-medium">Status Pemeriksaaan</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg
                          className="w-8 h-8 text-brand-500 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <p className="text-gray-500 font-medium">
                          Memuat data peserta...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPeserta.length > 0 ? (
                  filteredPeserta.map((peserta) => (
                    <tr
                      key={peserta.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">{peserta.no_bpjs}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                        {peserta.nama}
                      </td>
                      <td className="px-4 py-3">
                        {peserta.jenis_kelamin === "Pria" ||
                        peserta.jenis_kelamin === "Pria"
                          ? "Pria"
                          : "Wanita"}
                      </td>
                      <td className="px-4 py-3">{peserta.usia} Thn</td>
                      <td className="px-4 py-3">
                        {peserta.status_diperiksa ? (
                          <span className="text-success-500 font-medium flex items-center gap-1">
                            ✅ Selesai
                          </span>
                        ) : (
                          <span className="text-warning-500 font-medium flex items-center gap-1">
                            ⏳ Belum
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={
                            peserta.status_diperiksa ? "outline" : "primary"
                          }
                          onClick={() => openModal(peserta)}
                        >
                          {peserta.status_diperiksa
                            ? "Periksa Ulang"
                            : "Periksa"}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Peserta tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-gray-900 border dark:border-gray-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 text-lg dark:text-white">
                Input Pemeriksaan Peserta
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="mb-5 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 text-sm">
                <p>
                  Pasien:{" "}
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    {selectedPeserta?.nama} (
                    {selectedPeserta?.jenis_kelamin === "Pria" ||
                    selectedPeserta?.jenis_kelamin === "Pria"
                      ? "Pria"
                      : "Wanita"}
                    , {selectedPeserta?.usia} Thn)
                  </span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Pastikan input data angka dengan teliti.
                </p>
              </div>

              <form id="ttvForm" className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>Berat Badan (kg)</Label>
                    <Input
                      type="number"
                      name="berat_badan"
                      value={formData.berat_badan}
                      onChange={handleInputChange}
                      placeholder="Contoh: 65.5"
                    />
                    {/* Tampilkan Error Berat Badan */}
                    {errors.berat_badan && (
                      <p className="mt-1 text-xs text-error-500 text-red-500">
                        {errors.berat_badan[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Tinggi Badan (cm)</Label>
                    <Input
                      type="number"
                      name="tinggi_badan"
                      value={formData.tinggi_badan}
                      onChange={handleInputChange}
                      placeholder="Contoh: 165"
                    />
                    {/* Tampilkan Error Tinggi Badan */}
                    {errors.tinggi_badan && (
                      <p className="mt-1 text-xs text-error-500 text-red-500">
                        {errors.tinggi_badan[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>Sistolik (Atas)</Label>
                    <Input
                      type="number"
                      name="tensi_sistolik"
                      value={formData.tensi_sistolik}
                      onChange={handleInputChange}
                      placeholder="Contoh: 120"
                    />
                    {errors.tensi_sistolik && (
                      <p className="mt-1 text-xs text-error-500 text-red-500">
                        {errors.tensi_sistolik[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Diastolik (Bawah)</Label>
                    <Input
                      type="number"
                      name="tensi_diastolik"
                      value={formData.tensi_diastolik}
                      onChange={handleInputChange}
                      placeholder="Contoh: 80"
                    />
                    {errors.tensi_diastolik && (
                      <p className="mt-1 text-xs text-error-500 text-red-500">
                        {errors.tensi_diastolik[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>Gula Darah Puasa (mg/dL)</Label>
                    <Input
                      type="number"
                      name="gula_darah_puasa"
                      value={formData.gula_darah_puasa}
                      onChange={handleInputChange}
                      placeholder="Wajib diisi"
                    />
                    {errors.gula_darah_puasa && (
                      <p className="mt-1 text-xs text-error-500 text-red-500">
                        {errors.gula_darah_puasa[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Tingkat Aktivitas Fisik</Label>
                    <select
                      name="aktivitas"
                      value={formData.aktivitas}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Pilih tingkat aktivitas...</option>
                      <option value="Jarang">Jarang Olahraga</option>
                      <option value="Sedang">Sedang (1-2x Seminggu)</option>
                      <option value="Aktif">Aktif (Rutin)</option>
                    </select>
                    {errors.aktivitas && (
                      <p className="mt-1 text-xs text-error-500 text-red-500">
                        {errors.aktivitas[0]}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" onClick={closeModal}>
                Batal
              </Button>
              <Button
                onClick={() => handleSubmit()} // <--- Tambahkan baris ini agar fungsi dijalankan
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Pemeriksaan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
