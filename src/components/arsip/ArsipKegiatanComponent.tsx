import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ArsipKegiatan() {
  const [arsip, setArsip] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk Search dan Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const navigate = useNavigate();

  // Efek ini akan berjalan setiap kali `currentPage` atau `search` berubah
  useEffect(() => {
    // Memberikan sedikit delay (debounce) agar tidak spam hit API saat mengetik
    const delayDebounceFn = setTimeout(() => {
      fetchArsip(currentPage, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, search]);

  // Jika user mengetik pencarian baru, kembalikan ke halaman 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); 
  };

  const fetchArsip = async (page: number, searchQuery: string) => {
    try {
      setLoading(true);
      // Memanggil endpoint baru beserta query parameternya
      const response = await api.get(`/arsip-kegiatan?page=${page}&search=${searchQuery}`);
      
      // Struktur balikan dari Laravel paginate()
      setArsip(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotalData(response.data.total);
    } catch (error) {
      console.error("Gagal mengambil data arsip", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            🗄️ Arsip Kegiatan
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total {totalData} riwayat kegiatan ditemukan.
          </p>
        </div>

        {/* Input Pencarian */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="🔍 Cari kegiatan, tanggal, lokasi..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Kegiatan</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Lokasi</th>
                <th className="px-6 py-4 font-semibold text-center">Partisipasi</th>
                <th className="px-6 py-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">Memuat arsip...</td>
                </tr>
              ) : arsip.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    {search ? "Pencarian tidak ditemukan." : "Belum ada arsip kegiatan."}
                  </td>
                </tr>
              ) : (
                arsip.map((item) => {
                  const persentase = item.total_peserta_count > 0 
                    ? Math.round((item.hadir_count / item.total_peserta_count) * 100) 
                    : 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{item.nama_kegiatan}</td>
                      <td className="px-6 py-4">{item.tanggal}</td>
                      <td className="px-6 py-4">{item.lokasi}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {item.hadir_count} / {item.total_peserta_count} Hadir
                          </span>
                          {item.total_peserta_count > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700">
                              <div 
                                className={`h-1.5 rounded-full ${persentase >= 80 ? 'bg-emerald-500' : persentase >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                style={{ width: `${persentase}%` }}
                              ></div>
                            </div>
                          )}
                          <span className="text-xs text-gray-500 mt-1">{persentase}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/absen/${btoa(item.id.toString())}`)}
                          className="rounded-lg bg-blue-50 px-4 py-2 text-blue-600 font-medium hover:bg-blue-100 transition-colors border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                        >
                          Lihat Absensi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- Kontrol Paginasi --- */}
        {!loading && totalData > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Halaman {currentPage} dari {lastPage}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                disabled={currentPage === lastPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}