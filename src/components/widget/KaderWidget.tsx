import React, { useState, useEffect } from "react";
import api from "../../services/api"; 
// Menggunakan nama icon yang tepat dari index.ts TailAdmin
import { CalenderIcon, CheckCircleIcon, TimeIcon } from "../../icons"; 

interface WidgetStats {
  total_jadwal: number;
  selesai: number;
  mendatang: number;
}

export default function WidgetStatistikJadwal() {
  const [stats, setStats] = useState<WidgetStats>({
    total_jadwal: 0,
    selesai: 0,
    mendatang: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchWidgetStats();
  }, []);

  const fetchWidgetStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/statistik-jadwal");
      setStats(response.data);
    } catch (error) {
      console.error("Gagal memuat data statistik jadwal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 mb-6">
      {/* 1. Total Jadwal (Warna Biru) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-900/20">
          <CalenderIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Jadwal (Bulan Ini)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : stats.total_jadwal}
            </h4>
          </div>
        </div>
      </div>

      {/* 2. Kegiatan Selesai (Warna Hijau) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl dark:bg-emerald-900/20">
          <CheckCircleIcon className="text-emerald-600 size-6 dark:text-emerald-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Kegiatan Selesai
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : stats.selesai}
            </h4>
          </div>
        </div>
      </div>

      {/* 3. Jadwal Mendatang (Warna Kuning/Amber) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl dark:bg-amber-900/20">
          <TimeIcon className="text-amber-600 size-6 dark:text-amber-400" />
        </div>
        
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Jadwal Mendatang
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : stats.mendatang}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}