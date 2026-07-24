import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Sesuaikan path dengan proyek Anda
import Swal from "sweetalert2";

// --- INTERFACES ---
interface Riwayat {
  tanggal: string;
  berat_badan: number;
  tensi: string;
  gula_darah: number;
  status_gula: string;
}

interface Obat {
  nama_obat: string;
  dosis: string;
  jumlah: number | string;
  keterangan: string;
}

interface PesertaDokter {
  id: number;
  pemeriksaan_id: number;
  no_bpjs: string;
  nama: string;
  jenis_kelamin: string;
  usia: number;
  ttv_hari_ini: {
    berat_badan: number;
    tinggi_badan: number;
    imt: number;
    tensi: string;
    gula_darah: number;
    status_gula: string;
  };
  status_diperiksa_dokter: boolean;
  catatan_dokter: string | null;
  resep_obat?: Obat[]; // Tambahan optional untuk resep obat dari backend
  riwayat_terakhir: Riwayat[];
}

export default function PemeriksaanDokterComponent() {
  // --- STATES ---
  const [antreanList, setAntreanList] = useState<PesertaDokter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNoActiveSchedule, setIsNoActiveSchedule] = useState(false);
  const [jadwalInfo, setJadwalInfo] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaDokter | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    catatan_dokter: "",
    resep_obat: [] as Obat[],
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA (Dengan Auto-Refresh Latar Belakang) ---
  const fetchAntrean = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setIsNoActiveSchedule(false);

    try {
      const res = await api.get("/pemeriksaan-dokter/antrean");
      setAntreanList(res.data.data);
      if (res.data.detail_jadwal) {
        setJadwalInfo(res.data.detail_jadwal);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);

        // TAMBAHKAN POPUP INI AGAR KITA TAHU JIKA VALIDASI GAGAL
        Swal.fire({
          icon: "warning",
          title: "Data Tidak Lengkap",
          text: "Pastikan Catatan Dokter dan kolom resep obat (jika ada) terisi dengan benar.",
        });
      } else {
        Swal.fire(
          "Gagal",
          "Terjadi kesalahan koneksi saat menyimpan data.",
          "error",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Menambah baris obat baru
  const tambahObat = () => {
    setFormData({
      ...formData,
      resep_obat: [
        ...(formData.resep_obat || []),
        { nama_obat: "", dosis: "", jumlah: "", keterangan: "" },
      ],
    });
  };

  const hapusObat = (index: number) => {
    const resepBaru = [...(formData.resep_obat || [])];
    resepBaru.splice(index, 1);
    setFormData({ ...formData, resep_obat: resepBaru });
  };

  // Menangani perubahan input pada baris tertentu
  const handleObatChange = (
    index: number,
    field: keyof Obat,
    value: string,
  ) => {
    const resepBaru = [...(formData.resep_obat || [])];
    resepBaru[index] = { ...resepBaru[index], [field]: value };
    setFormData({ ...formData, resep_obat: resepBaru });
  };

  useEffect(() => {
    fetchAntrean();
    // Auto-refresh setiap 15 detik agar antrean dari perawat otomatis masuk
    const interval = setInterval(() => fetchAntrean(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const openModal = (peserta: PesertaDokter) => {
    setSelectedPeserta(peserta);

    // PERBAIKAN DI SINI: Pastikan resep_obat tidak hilang
    setFormData({
      catatan_dokter: peserta.catatan_dokter || "",
      resep_obat: peserta.resep_obat || [], // Default ke array kosong jika belum ada
    });

    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPeserta(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPeserta) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post(
        `/pemeriksaan-dokter/simpan/${selectedPeserta.pemeriksaan_id}`,
        formData,
      );

      Swal.fire({
        icon: "success",
        title: "Tersimpan!",
        text: `Catatan medis untuk ${selectedPeserta.nama} berhasil disimpan.`,
        timer: 2000,
        showConfirmButton: false,
      });

      // Update data di tabel secara lokal tanpa harus fetch ulang keseluruhan
      setAntreanList((prev) =>
        prev.map((p) =>
          p.id === selectedPeserta.id
            ? {
                ...p,
                status_diperiksa_dokter: true,
                catatan_dokter: formData.catatan_dokter,
                resep_obat: formData.resep_obat,
              }
            : p,
        ),
      );
      closeModal();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FILTER PENCARIAN ---
  const filteredAntrean = antreanList.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.no_bpjs.includes(searchQuery),
  );

  // --- RENDER ---
  return (
    <>
      <div className="space-y-6">
        {/* PANEL INFORMASI KEGIATAN */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
            <div className="h-6 w-1/3 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        ) : jadwalInfo ? (
          <div className="rounded-2xl border-l-4 border-brand-500 bg-white p-5 shadow-sm dark:bg-white/[0.03]">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              {jadwalInfo.nama_kegiatan}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Stasiun 3: Konsultasi Dokter | Antrean masuk: {antreanList.length}{" "}
              Pasien
            </p>
          </div>
        ) : null}

        {isNoActiveSchedule && !loading ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
            <p className="text-gray-500">
              Belum ada kegiatan Prolanis yang aktif hari ini.
            </p>
          </div>
        ) : (
          <>
            {/* HEADER TABEL & PENCARIAN */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-title-md2 font-semibold text-gray-800 dark:text-white/90">
                Antrean Konsultasi
              </h2>
              <input
                type="text"
                placeholder="Cari Nama / No BPJS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* TABEL PASIEN */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-gray-800 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white/90">
                  <tr>
                    <th className="py-3 px-4 font-medium">No. BPJS</th>
                    <th className="py-3 px-4 font-medium">Nama Peserta</th>
                    <th className="py-3 px-4 font-medium">L/P (Usia)</th>
                    <th className="py-3 px-4 font-medium">Tensi / GDP</th>
                    <th className="py-3 px-4 font-medium">Status Medis</th>
                    <th className="py-3 px-4 font-medium text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAntrean.map((peserta) => (
                    <tr
                      key={peserta.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                    >
                      <td className="py-3 px-4 font-mono text-xs">
                        {peserta.no_bpjs}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-white/90">
                        {peserta.nama}
                      </td>
                      <td className="py-3 px-4">
                        {peserta.jenis_kelamin === "L"
                          ? "Laki-laki"
                          : "Perempuan"}{" "}
                        ({peserta.usia} th)
                      </td>
                      <td className="py-3 px-4">
                        <span className="block font-medium">
                          {peserta.ttv_hari_ini.tensi}
                        </span>
                        <span
                          className={`text-xs ${peserta.ttv_hari_ini.status_gula.includes("Tinggi") ? "text-red-500 font-bold" : "text-green-500"}`}
                        >
                          {peserta.ttv_hari_ini.gula_darah} mg/dL
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {peserta.status_diperiksa_dokter ? (
                          <span className="inline-flex rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/20">
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/20 animate-pulse">
                            Menunggu
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openModal(peserta)}
                          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                        >
                          {peserta.status_diperiksa_dokter
                            ? "Edit Resep"
                            : "Periksa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAntrean.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-500"
                      >
                        Tidak ada antrean atau pasien tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL PEMERIKSAAN DOKTER */}
      {isModalOpen && selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  Konsultasi Medis
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedPeserta.nama} ({selectedPeserta.usia} Tahun)
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KOLOM KIRI: DATA KLINIS */}
              <div className="space-y-5">
                {/* Hasil TTV Hari Ini */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                  <h4 className="mb-3 text-sm font-bold text-blue-800 dark:text-blue-400 border-b border-blue-200 pb-2">
                    Hasil Skrining Hari Ini (Oleh Perawat)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-gray-500">Tekanan Darah</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {selectedPeserta.ttv_hari_ini.tensi} mmHg
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500">
                        Gula Darah Puasa
                      </span>
                      <span
                        className={`font-bold ${selectedPeserta.ttv_hari_ini.status_gula.includes("Tinggi") ? "text-red-500" : "text-green-500"}`}
                      >
                        {selectedPeserta.ttv_hari_ini.gula_darah} mg/dL
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Berat Badan</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedPeserta.ttv_hari_ini.berat_badan} kg
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500">IMT</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedPeserta.ttv_hari_ini.imt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Riwayat Kunjungan Sebelumnya */}
                <div>
                  <h4 className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                    Riwayat 3 Kunjungan Terakhir
                  </h4>
                  {selectedPeserta.riwayat_terakhir?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPeserta.riwayat_terakhir.map((riwayat, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                          <div className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                            {riwayat.tanggal}
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>
                              Tensi:{" "}
                              <strong className="text-gray-800 dark:text-gray-300">
                                {riwayat.tensi}
                              </strong>
                            </span>
                            <span>
                              GDP:{" "}
                              <strong
                                className={
                                  riwayat.status_gula.includes("Tinggi")
                                    ? "text-red-500"
                                    : "text-green-500"
                                }
                              >
                                {riwayat.gula_darah}
                              </strong>
                            </span>
                            <span>
                              BB:{" "}
                              <strong className="text-gray-800 dark:text-gray-300">
                                {riwayat.berat_badan} kg
                              </strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg dark:bg-gray-800">
                      Tidak ada riwayat medis sebelumnya (Pasien Baru).
                    </p>
                  )}
                </div>
              </div>

              {/* KOLOM KANAN: FORM DOKTER */}
              <div className="flex flex-col h-full">
                <form id="dokterForm" className="flex flex-col h-full gap-5">
                  {/* Kotak 1: Catatan Medis & Diagnosis */}
                  <div className="flex flex-col">
                    <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-white/90">
                      Diagnosis & Catatan Medis{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="Contoh: Hipertensi primer (I10). Pasien mengeluh pusing..."
                      value={formData.catatan_dokter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          catatan_dokter: e.target.value,
                        })
                      }
                    ></textarea>
                    {errors.catatan_dokter && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.catatan_dokter[0]}
                      </p>
                    )}
                  </div>

                  {/* Kotak 2: Resep Obat Dinamis */}
                  <div className="flex flex-col flex-1 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        Resep Obat{" "}
                        <span className="text-xs font-normal text-gray-500 ml-2">
                          (Diteruskan ke Farmasi)
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={tambahObat}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Tambah Obat
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.resep_obat?.map((obat, index) => (
                        <div
                          key={index}
                          className="flex gap-2 rounded-lg border border-emerald-100 bg-emerald-50/20 p-2 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                        >
                          {/* Nama Obat */}
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Nama Obat (mis: Amlodipin 5mg)"
                              value={obat.nama_obat}
                              onChange={(e) =>
                                handleObatChange(
                                  index,
                                  "nama_obat",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>

                          {/* Dosis */}
                          <div className="w-24">
                            <input
                              type="text"
                              placeholder="Dosis (3x1)"
                              value={obat.dosis}
                              onChange={(e) =>
                                handleObatChange(index, "dosis", e.target.value)
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>

                          {/* Jumlah */}
                          <div className="w-20">
                            <input
                              type="number"
                              placeholder="Jml (30)"
                              value={obat.jumlah}
                              onChange={(e) =>
                                handleObatChange(
                                  index,
                                  "jumlah",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>

                          {/* Keterangan */}
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Ket. (Sesudah makan)"
                              value={obat.keterangan}
                              onChange={(e) =>
                                handleObatChange(
                                  index,
                                  "keterangan",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </div>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => hapusObat(index)}
                            className="flex items-center justify-center rounded px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {(!formData.resep_obat ||
                        formData.resep_obat.length === 0) && (
                        <div className="rounded-lg border border-dashed border-gray-300 py-6 text-center text-sm text-gray-500 dark:border-gray-700">
                          Tidak ada resep obat. Klik "Tambah Obat" untuk
                          meresepkan.
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Konsultasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
