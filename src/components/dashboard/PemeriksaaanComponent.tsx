import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";
import PageMeta from "../common/PageMeta";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";

interface Peserta {
  id: number;
  nama: string;
  no_bpjs: string;
  usia: number; 
  status_diperiksa: boolean;
}

export default function PemeriksaanFisikComponent() {
  const { kegiatanId } = useParams(); 

  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. STATE BARU: Untuk menyimpan teks pencarian
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    berat_badan: "",
    tinggi_badan: "",
    tensi_sistolik: "",
    tensi_diastolik: "",
    gula_darah_puasa: "",
    aktivitas: "",
  });

  useEffect(() => {
    setPesertaList([
      { id: 1, nama: "Bapak Budi", no_bpjs: "000123456789", usia: 65, status_diperiksa: false },
      { id: 2, nama: "Ibu Siti", no_bpjs: "000987654321", usia: 62, status_diperiksa: true },
      { id: 3, nama: "Agus Santoso", no_bpjs: "000333444555", usia: 58, status_diperiksa: false },
    ]);
  }, []);

  // 2. LOGIKA PENCARIAN: Filter data berdasarkan Nama atau BPJS
  const filteredPeserta = pesertaList.filter((peserta) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      peserta.nama.toLowerCase().includes(searchLower) ||
      peserta.no_bpjs.includes(searchLower)
    );
  });

  const openModal = (peserta: Peserta) => {
    setSelectedPeserta(peserta);
    setFormData({
      berat_badan: "",
      tinggi_badan: "",
      tensi_sistolik: "",
      tensi_diastolik: "",
      gula_darah_puasa: "",
      aktivitas: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPeserta(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/upsert-pemeriksaan", { 
        jadwal_kegiatan_id: kegiatanId || 1, 
        pesertaid: selectedPeserta?.id,
        ...formData
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data TTV ${selectedPeserta?.nama} berhasil disimpan.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setPesertaList(prev => prev.map(p => p.id === selectedPeserta?.id ? { ...p, status_diperiksa: true } : p));
      closeModal();
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Pemeriksaan Fisik | Smart-PROLANIS" description="Input TTV Peserta" />
      
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title-md2 font-semibold text-gray-800 dark:text-white/90">
              Stasiun 2: Pemeriksaan Fisik & TTV
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Daftar peserta yang hadir pada kegiatan ini.
            </p>
          </div>

          {/* 3. UI PENCARIAN: Kotak Input Cari */}
          <div className="relative w-full sm:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <th className="px-4 py-3 font-medium">Usia</th>
                  <th className="px-4 py-3 font-medium">Status TTV</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* 4. RENDER DATA YANG SUDAH DIFILTER */}
                {filteredPeserta.length > 0 ? (
                  filteredPeserta.map((peserta) => (
                    <tr key={peserta.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">{peserta.no_bpjs}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">{peserta.nama}</td>
                      <td className="px-4 py-3">{peserta.usia} Tahun</td>
                      <td className="px-4 py-3">
                        {peserta.status_diperiksa ? (
                          <span className="text-success-500 font-medium">✅ Selesai</span>
                        ) : (
                          <span className="text-warning-500 font-medium">⏳ Belum</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={peserta.status_diperiksa ? "outline" : "primary"}
                          onClick={() => openModal(peserta)}
                        >
                          {peserta.status_diperiksa ? "Edit TTV" : "Input TTV"}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Peserta tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ... MODAL FORM SAMA SEPERTI SEBELUMNYA ... */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           {/* Modal Content */}
        </div>
      )}
    </>
  );
}