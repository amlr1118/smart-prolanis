<?php

namespace App\Http\Controllers;

use App\Models\JadwalKegiatanModel;
use App\Models\PemeriksaanModel;
use App\Models\ResepObatModel;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PemeriksaanDokterController extends Controller
{
    public function getAntreanDokter(Request $request)
    {
        $jadwalAktif = JadwalKegiatanModel::where('is_active', true)->where('status', 1)->first();

        if (!$jadwalAktif) {
            return response()->json(['message' => 'Tidak ada jadwal aktif saat ini.', 'data' => []], 404);
        }

        $kegiatanId = $jadwalAktif->id;

        $pemeriksaanHariIni = PemeriksaanModel::with('relasikePeserta')
            ->where('jadwal_kegiatan_id', $kegiatanId)
            ->orderBy('updated_at', 'desc')
            ->get();

        $dataAntrean = $pemeriksaanHariIni->map(function ($periksa) use ($kegiatanId) {
            $peserta = $periksa->relasikePeserta;
            $usia = $peserta->tanggal_lahir ? \Carbon\Carbon::parse($peserta->tanggal_lahir)->age : 0;

            // Ambil 3 riwayat terakhir
            $riwayat = PemeriksaanModel::where('pesertaid', $peserta->id)
                ->where('jadwal_kegiatan_id', '!=', $kegiatanId)
                ->orderBy('created_at', 'desc')->take(3)->get()->map(function ($r) {
                    return [
                        'tanggal' => $r->created_at->translatedFormat('d M Y'),
                        'berat_badan' => $r->berat_badan,
                        'tensi' => $r->tensi_sistolik . '/' . $r->tensi_diastolik,
                        'gula_darah' => $r->gula_darah_puasa,
                        'status_gula' => $r->status_gula_darah,
                    ];
                });

            // =========================================================
            // PERBAIKAN: Ambil resep obat untuk pasien ini
            // =========================================================
            $resepObat = ResepObatModel::where('pemeriksaan_id', $periksa->id)->get();

            return [
                'id' => $peserta->id,
                'pemeriksaan_id' => $periksa->id,
                'no_bpjs' => $peserta->no_bpjs,
                'nama' => $peserta->nama,
                'jenis_kelamin' => $peserta->jenis_kelamin,
                'usia' => $usia,
                'ttv_hari_ini' => [
                    'berat_badan' => $periksa->berat_badan,
                    'tinggi_badan' => $periksa->tinggi_badan,
                    'imt' => $periksa->imt,
                    'tensi' => $periksa->tensi_sistolik . '/' . $periksa->tensi_diastolik,
                    'gula_darah' => $periksa->gula_darah_puasa,
                    'status_gula' => $periksa->status_gula_darah,
                ],
                'status_diperiksa_dokter' => $periksa->catatan_dokter ? true : false,
                'catatan_dokter' => $periksa->catatan_dokter,

                // Masukkan data resep ke JSON Response
                'resep_obat' => $resepObat,

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
        // 1. Validasi sederhana
        $request->validate([
            'catatan_dokter' => 'required|string',
        ]);

        $pemeriksaan = PemeriksaanModel::find($pemeriksaan_id);

        if (!$pemeriksaan) {
            return response()->json(['message' => 'Data pemeriksaan tidak ditemukan.'], 404);
        }

        // 2. Simpan Catatan Dokter
        $pemeriksaan->update([
            'catatan_dokter' => $request->catatan_dokter,
            'dokterid'       => auth()->user()->id,
        ]);

        // 3. Simpan Resep Obat
        // Hapus resep lama agar tidak duplikat saat dokter meng-edit
        ResepObatModel::where('pemeriksaan_id', $pemeriksaan_id)->delete();

        // Insert resep baru (Looping array dari React)
        if ($request->has('resep_obat') && is_array($request->resep_obat)) {
            foreach ($request->resep_obat as $obat) {
                // Cegah baris kosong tersimpan
                if (!empty($obat['nama_obat']) && !empty($obat['dosis'])) {
                    ResepObatModel::create([
                        'pemeriksaan_id' => $pemeriksaan_id,
                        'nama_obat'      => $obat['nama_obat'],
                        'dosis'          => $obat['dosis'],
                        'jumlah'         => $obat['jumlah'] ?: 1, // Jika kosong, set default 1
                        'keterangan'     => $obat['keterangan'] ?? '-',
                        'status_tebus'   => 0,
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Berhasil disimpan'], 200);
    }
}
