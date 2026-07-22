import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Pastikan path ini sesuai dengan struktur folder Anda


interface WidgetProps {
  refreshTrigger?: number; 
}

// 2. Terima props refreshTrigger (default: 0)
export default function PemeriksaanWidget({ refreshTrigger = 0 }: WidgetProps) {
  const [statistik, setStatistik] = useState({
    totalHadir: 0,
    sudahDiperiksa: 0,
    belumDiperiksa: 0,
  });

  const fetchStatistik = async () => {
    try {
      const res = await api.get("/widget/statistik-pemeriksaan");
      if (res.data && res.data.data) {
        setStatistik(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data statistik pemeriksaan:", error);
    }
  };

  // 3. Masukkan refreshTrigger ke dalam array dependency useEffect
  useEffect(() => {
    fetchStatistik();
  }, [refreshTrigger]); // <--- Widget akan fetch ulang jika angka ini berubah

  const { totalHadir, sudahDiperiksa, belumDiperiksa } = statistik;
  const progressPercent = totalHadir === 0 ? 0 : Math.round((sudahDiperiksa / totalHadir) * 100);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">

      
      
      {/* WIDGET 1: TOTAL HADIR */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pasien Hadir</p>
            <h4 className="mt-1 text-title-md font-bold text-gray-800 dark:text-white/90">
              {totalHadir} <span className="text-sm font-medium text-gray-500">Orang</span>
            </h4>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/20">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* WIDGET 2: SUDAH DIPERIKSA */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Selesai Diperiksa</p>
            <h4 className="mt-1 text-title-md font-bold text-success-600 dark:text-success-500">
              {sudahDiperiksa} <span className="text-sm font-medium text-gray-500">Orang</span>
            </h4>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600 dark:bg-success-500/20">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div className="bg-success-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{progressPercent}% Selesai</p>
      </div>

      {/* WIDGET 3: BELUM DIPERIKSA (ANTREAN) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sisa Antrean</p>
            <h4 className="mt-1 text-title-md font-bold text-warning-500 dark:text-warning-400">
              {belumDiperiksa} <span className="text-sm font-medium text-gray-500">Orang</span>
            </h4>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-500 dark:bg-warning-500/20">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}