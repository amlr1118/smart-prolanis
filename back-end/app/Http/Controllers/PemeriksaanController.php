<?php

namespace App\Http\Controllers;

use App\Models\AbsenModel;
use App\Models\JadwalKegiatanModel;
use App\Models\PemeriksaanModel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PemeriksaanController extends Controller
{
    public function index(Request $request)
    {
    }

    public function store(Request $request)
    {
    }

    public function upsertPemeriksaan(Request $request)
    {
        // 1. Aturan Validasi (Semua input TTV diubah menjadi required)
        $rules = [
            'jadwal_kegiatan_id' => 'required|integer',
            'pesertaid'          => 'required|integer',
            'berat_badan'        => 'required|numeric',
            'tinggi_badan'       => 'required|numeric',
            'tensi_sistolik'     => 'required|integer',
            'tensi_diastolik'    => 'required|integer',
            'gula_darah_puasa'   => 'required|numeric',
            'aktivitas'          => 'required|string',
            'catatan_dokter'     => 'nullable|string', // Tetap nullable karena baru akan diisi oleh Dokter di Stasiun 3
        ];

        // 2. Kustomisasi Pesan Error ke Bahasa Indonesia
        $messages = [
            'required' => ':attribute tidak boleh kosong.',
            'numeric'  => ':attribute harus berupa angka (boleh desimal).',
            'integer'  => ':attribute harus berupa angka bulat.',
            'string'   => ':attribute tidak valid.',
        ];

        // 3. Kustomisasi Nama Kolom (Agar pesan error mudah dibaca user)
        $attributes = [
            'berat_badan'        => 'Berat badan',
            'tinggi_badan'       => 'Tinggi badan',
            'tensi_sistolik'     => 'Tekanan darah sistolik',
            'tensi_diastolik'    => 'Tekanan darah diastolik',
            'gula_darah_puasa'   => 'Gula darah',
            'aktivitas'          => 'Aktivitas fisik',
        ];

        // Jalankan validasi
        $request->validate($rules, $messages, $attributes);

        $user = Auth::user();

        // Hitung IMT Otomatis
        $imt = null;
        if ($request->berat_badan && $request->tinggi_badan) {
            $tinggiMeter = $request->tinggi_badan / 100;
            if ($tinggiMeter > 0) {
                $imt = round($request->berat_badan / ($tinggiMeter * $tinggiMeter), 2);
            }
        }

        // 2. Tentukan Status Gula Darah Otomatis
        $statusGula = null;
        if ($request->gula_darah_puasa) {
            $gdp = $request->gula_darah_puasa;
            if ($gdp < 70) {
                $statusGula = 'Rendah (Hipoglikemia)';
            } elseif ($gdp >= 70 && $gdp <= 125) {
                $statusGula = 'Normal / Terkontrol';
            } else {
                $statusGula = 'Tinggi (Tidak Terkontrol)';
            }
        }

        // Siapkan data yang akan disimpan
        $dataToSave = [
            'berat_badan'       => $request->berat_badan,
            'tinggi_badan'      => $request->tinggi_badan,
            'imt'               => $imt,
            'tensi_sistolik'    => $request->tensi_sistolik,
            'tensi_diastolik'   => $request->tensi_diastolik,
            'gula_darah_puasa'  => $request->gula_darah_puasa,
            'status_gula_darah' => $statusGula,
            'aktivitas'         => $request->aktivitas,
        ];

        // Deteksi Role: Perawat (2) atau Dokter (1)
        if ($user->role == 2) {
            $dataToSave['perawatid'] = $user->id;
        } else if ($user->role == 1) {
            $dataToSave['dokterid'] = $user->id;
            $dataToSave['catatan_dokter'] = $request->catatan_dokter;
        }

        // Simpan Data
        $pemeriksaan = PemeriksaanModel::updateOrCreate(
            [
                'jadwal_kegiatan_id' => $request->jadwal_kegiatan_id,
                'pesertaid' => $request->pesertaid,
            ],
            $dataToSave
        );

        return response()->json([
            'message' => 'Data pemeriksaan berhasil disimpan.',
            'data' => $pemeriksaan
        ], 200);
    }

    public function getPesertaHadir()
    {
        // 1. Cari jadwal yang sedang aktif
        $jadwalAktif = JadwalKegiatanModel::where('is_active', true)
            ->where('status', 1)
            ->first();

        // Jika tidak ada jadwal aktif, kembalikan response 404
        if (!$jadwalAktif) {
            return response()->json([
                'message' => 'Tidak ada kegiatan yang sedang berlangsung saat ini.',
                'kegiatan_id' => null,
                'data' => []
            ], 404);
        }

        $kegiatanId = $jadwalAktif->id;

        // 2. Ambil absensi berdasarkan jadwal aktif tersebut
        $absensi = AbsenModel::with('relasikePeserta')
            ->where('kegiatanid', $kegiatanId)
            ->where('status_kehadiran', true)
            ->get();

        // 3. Format data peserta
        $dataPeserta = $absensi->map(function ($absen) use ($kegiatanId) {
            $peserta = $absen->relasikePeserta;
            $usia = $peserta->tanggal_lahir ? Carbon::parse($peserta->tanggal_lahir)->age : 0;

            $pemeriksaan = PemeriksaanModel::where('jadwal_kegiatan_id', $kegiatanId)
                ->where('pesertaid', $peserta->id)
                ->first();

            return [
                'id' => $peserta->id,
                'no_bpjs' => $peserta->no_bpjs,
                'nama' => $peserta->nama,
                'jenis_kelamin' => $peserta->jenis_kelamin,
                'usia' => $usia,
                'status_diperiksa' => $pemeriksaan ? true : false,
                'data_ttv' => $pemeriksaan
            ];
        });

        // 4. Kembalikan data BESERTA ID Kegiatan agar bisa dipakai oleh React saat menyimpan form
        return response()->json([
            'message' => 'Berhasil mengambil daftar peserta',
            'kegiatan_id' => $kegiatanId, // ID ini penting untuk proses POST nanti
            'data' => $dataPeserta,
            'detail_jadwal' => [
                'nama_kegiatan' => $jadwalAktif->nama_kegiatan, // Sesuaikan nama kolom DB
                'tanggal' => Carbon::parse($jadwalAktif->tanggal)->translatedFormat('l, d F Y'), // Format: Senin, 10 Agustus 2024
                'lokasi' => $jadwalAktif->lokasi, // Sesuaikan nama kolom DB
            ],
        ], 200);
    }


    public function getStatistikPemeriksaan()
    {
        // 1. Cari jadwal yang sedang aktif hari ini
        $jadwalAktif = JadwalKegiatanModel::where('is_active', true)
            ->where('status', 1)
            ->first();

        // Jika tidak ada jadwal aktif, kembalikan angka 0 (status 200 agar Frontend tidak error)
        if (!$jadwalAktif) {
            return response()->json([
                'message' => 'Tidak ada jadwal aktif saat ini.',
                'data' => [
                    'totalHadir' => 0,
                    'sudahDiperiksa' => 0,
                    'belumDiperiksa' => 0,
                ]
            ], 200);
        }

        $kegiatanId = $jadwalAktif->id;

        // 2. Hitung jumlah pasien yang HADIR di jadwal aktif
        $totalHadir = AbsenModel::where('kegiatanid', $kegiatanId)
            ->where('status_kehadiran', true) // true = Hadir
            ->count();

        // 3. Hitung jumlah pasien yang SUDAH DIPERIKSA (ada datanya di tabel Pemeriksaan)
        // Jika pasien hadir dan sudah diperiksa, datanya akan tersimpan di PemeriksaanModel
        $sudahDiperiksa = PemeriksaanModel::where('jadwal_kegiatan_id', $kegiatanId)->count();

        // 4. Hitung Sisa Antrean (Belum Diperiksa)
        $belumDiperiksa = $totalHadir - $sudahDiperiksa;
        
        // Mencegah angka minus jika ada anomali (misal: data dihapus manual di DB)
        if ($belumDiperiksa < 0) {
            $belumDiperiksa = 0;
        }

        return response()->json([
            'message' => 'Berhasil mengambil statistik pemeriksaan',
            'data' => [
                'totalHadir' => $totalHadir,
                'sudahDiperiksa' => $sudahDiperiksa,
                'belumDiperiksa' => $belumDiperiksa,
            ]
        ], 200);
    }
}
