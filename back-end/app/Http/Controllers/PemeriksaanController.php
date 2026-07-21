<?php

namespace App\Http\Controllers;

use App\Models\AbsenModel;
use App\Models\PemeriksaanModel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PemeriksaanController extends Controller
{
    public function index(Request $request) {}

    public function store(Request $request) {}

    public function getPesertaHadir($kegiatanId)
    {
        // 1. Ambil data absensi berdasarkan jadwal & HANYA yang hadir
        // Gunakan eager loading 'with('peserta')' agar tidak berat di database
        $absensi = AbsenModel::with('relasikePeserta')
            ->where('kegiatanid', $kegiatanId)
            ->where('status_kehadiran', 'Hadir') // Sesuaikan dengan value di DB Anda
            ->get();

        // 2. Format ulang datanya untuk dikirim ke React
        $dataPeserta = $absensi->map(function ($absen) use ($kegiatanId) {
            $peserta = $absen->relasikePeserta;

            // Hitung usia otomatis menggunakan Carbon (Berdasarkan tanggal lahir)
            $usia = 0;
            if ($peserta->tanggal_lahir) {
                $usia = Carbon::parse($peserta->tanggal_lahir)->age;
            }

            // Cek apakah peserta ini SUDAH diperiksa di jadwal ini?
            $pemeriksaan = PemeriksaanModel::where('jadwal_kegiatan_id', $kegiatanId)
                ->where('pesertaid', $peserta->id)
                ->first();

            return [
                'id' => $peserta->id,
                'no_bpjs' => $peserta->no_bpjs, // Sesuaikan nama kolom BPJS di tabel peserta
                'nama' => $peserta->nama,
                'usia' => $usia,
                'status_diperiksa' => $pemeriksaan ? true : false,

                // Jika sudah diperiksa, kita kirimkan juga data TTV-nya
                // agar di React nanti tombol "Edit TTV" bisa memunculkan data lama
                'data_ttv' => $pemeriksaan
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil daftar peserta hadir',
            'data' => $dataPeserta
        ], 200);
    }
}
