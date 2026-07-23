<?php

namespace App\Http\Controllers;

use App\Models\JadwalKegiatanModel;
use App\Models\PemeriksaanModel;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PemeriksaanDokterController extends Controller
{
    public function getAntreanDokter(Request $request)
    {
        // Cari jadwal aktif hari ini
        $jadwalAktif = JadwalKegiatanModel::where('is_active', true)->where('status', 1)->first();

        if (!$jadwalAktif) {
            return response()->json([
                'message' => 'Tidak ada jadwal aktif saat ini.',
                'data' => []
            ], 404);
        }

        $kegiatanId = $jadwalAktif->id;

        // Ambil pasien yang SUDAH diukur TTV oleh perawat hari ini
        // Menggunakan join ke tabel pemeriksaan
        $pemeriksaanHariIni = PemeriksaanModel::with('peserta')
            ->where('jadwal_kegiatan_id', $kegiatanId)
            ->orderBy('updated_at', 'desc')
            ->get();

        $dataAntrean = $pemeriksaanHariIni->map(function ($periksa) use ($kegiatanId) {
            $peserta = $periksa->peserta;
            $usia = $peserta->tanggal_lahir ? Carbon::parse($peserta->tanggal_lahir)->age : 0;

            // AMBIL 3 RIWAYAT TERAKHIR (Untuk ditampilkan di layar Dokter)
            $riwayat = PemeriksaanModel::where('pesertaid', $peserta->id)

            
                ->where('jadwal_kegiatan_id', '!=', $kegiatanId)
                ->orderBy('created_at', 'desc')
                ->take(3)
                ->get()
                ->map(function($r) {
                    return [
                        'tanggal' => $r->created_at->translatedFormat('d M Y'),
                        'berat_badan' => $r->berat_badan,
                        'tensi' => $r->tensi_sistolik . '/' . $r->tensi_diastolik,
                        'gula_darah' => $r->gula_darah_puasa,
                        'status_gula' => $r->status_gula_darah,
                    ];
                });

            return [
                'id' => $peserta->id,
                'pemeriksaan_id' => $periksa->id, // Penting untuk update data nanti
                'no_bpjs' => $peserta->no_bpjs,
                'nama' => $peserta->nama,
                'jenis_kelamin' => $peserta->jenis_kelamin,
                'usia' => $usia,
                
                // Data TTV Hari ini (Dari Perawat)
                'ttv_hari_ini' => [
                    'berat_badan' => $periksa->berat_badan,
                    'tinggi_badan' => $periksa->tinggi_badan,
                    'imt' => $periksa->imt,
                    'tensi' => $periksa->tensi_sistolik . '/' . $periksa->tensi_diastolik,
                    'gula_darah' => $periksa->gula_darah_puasa,
                    'status_gula' => $periksa->status_gula_darah,
                ],
                
                // Cek apakah dokter sudah mengisi catatan
                'status_diperiksa_dokter' => $periksa->catatan_dokter ? true : false,
                'catatan_dokter' => $periksa->catatan_dokter,
                
                // Riwayat Pemeriksaan Sebelumnya
                'riwayat_terakhir' => $riwayat
            ];
        });

        return response()->json([
            'kegiatan_id' => $kegiatanId,
            'detail_jadwal' => $jadwalAktif,
            'data' => $dataAntrean
        ], 200);
    }

    public function simpanPemeriksaanDokter(Request $request, $pemeriksaan_id)
    {
        // Validasi input dokter
        $request->validate([
            'catatan_dokter' => 'required|string',
            // 'resep_obat' => 'nullable|string', // Aktifkan jika Anda punya kolom resep_obat di tabel
        ], [
            'catatan_dokter.required' => 'Catatan / Diagnosis Dokter wajib diisi.',
        ]);

        $pemeriksaan = PemeriksaanModel::find($pemeriksaan_id);

        if (!$pemeriksaan) {
            return response()->json(['message' => 'Data pemeriksaan tidak ditemukan.'], 404);
        }

        // Update data pemeriksaan dengan inputan dokter
        $pemeriksaan->update([
            'catatan_dokter' => $request->catatan_dokter,
            // 'resep_obat' => $request->resep_obat, // Aktifkan jika ada
            'dokterid' => auth()->user()->id, // Menyimpan ID Dokter yang memeriksa
        ]);

        return response()->json([
            'message' => 'Data konsultasi dokter berhasil disimpan.'
        ], 200);
    }
}
