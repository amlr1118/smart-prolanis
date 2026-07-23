<?php

namespace Database\Seeders;

use App\Models\PesertaProlanisModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\PesertaModel; // Sesuaikan dengan model Peserta Anda
use App\Models\JadwalKegiatanModel;
use App\Models\AbsenModel;
use App\Models\PemeriksaanModel;

class RiwayatPemeriksaanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil seluruh data peserta yang sudah ada
        $pesertaList = PesertaProlanisModel::all();

        if ($pesertaList->count() === 0) {
            $this->command->info('Data Peserta kosong! Silakan jalankan seeder peserta terlebih dahulu.');
            return;
        }

        $this->command->info('Mulai membuat data dummy untuk 6 bulan terakhir...');

        // =========================================================================
        // PERBAIKAN: Tentukan tinggi badan TETAP untuk masing-masing peserta
        // agar tidak berubah-ubah setiap bulannya.
        // =========================================================================
        $tinggiPeserta = [];
        foreach ($pesertaList as $peserta) {
            $tinggiPeserta[$peserta->id] = rand(145, 175);
        }

        // Loop mundur dari 6 bulan yang lalu hingga bulan lalu
        for ($i = 6; $i >= 1; $i--) {
            // Tentukan tanggal acak di bulan tersebut (misal antara tanggal 5 sampai 20)
            $tanggalKegiatan = Carbon::now()->subMonths($i)->startOfMonth()->addDays(rand(4, 19));

            // 1. BUAT JADWAL KEGIATAN
            $jadwal = JadwalKegiatanModel::create([
                'nama_kegiatan'  => 'Senam & Edukasi Prolanis ' . $tanggalKegiatan->translatedFormat('F Y'),
                'petugasid'      => 5,
                'jenis_kegiatan' => '-',
                'tanggal'        => $tanggalKegiatan->format('Y-m-d'),
                'lokasi'         => 'Aula Puskesmas',
                'status'         => 2, // Asumsi 2 = Selesai
                'is_active'      => false, // Sudah berlalu
                'created_at'     => $tanggalKegiatan,
                'updated_at'     => $tanggalKegiatan,
            ]);

            // 2. BUAT ABSEN & PEMERIKSAAN UNTUK SETIAP PESERTA
            foreach ($pesertaList as $peserta) {
                // Buat probabilitas kehadiran realistis (sekitar 85% peluang hadir)
                $isHadir = rand(1, 100) <= 85;

                // Buat Data Absensi
                AbsenModel::create([
                    'kegiatanid'       => $jadwal->id,
                    'pesertaid'        => $peserta->id,
                    'status_kehadiran' => $isHadir,
                    'stasiun'          => '2',
                    'created_at'       => $tanggalKegiatan,
                    'updated_at'       => $tanggalKegiatan,
                ]);

                // 3. JIKA HADIR, BUAT DATA PEMERIKSAAN TTV
                if ($isHadir) {
                    
                    // =========================================================================
                    // PERBAIKAN: Gunakan tinggi badan tetap yang sudah di-generate di atas
                    // =========================================================================
                    $tinggiCm = $tinggiPeserta[$peserta->id];
                    
                    // Berat badan boleh berfluktuasi sedikit setiap bulan
                    $beratKg  = rand(50, 85) + (rand(0, 9) / 10); 
                    
                    // Hitung IMT
                    $tinggiM = $tinggiCm / 100;
                    $imt     = round($beratKg / ($tinggiM * $tinggiM), 2);

                    // Generate Tensi Darah
                    $tensiSistolik  = rand(110, 165);
                    $tensiDiastolik = rand(70, 100);

                    // Generate Gula Darah & Statusnya (Standar PERKENI)
                    $gulaDarah = rand(65, 210);
                    $statusGula = 'Normal / Terkontrol';
                    if ($gulaDarah < 70) {
                        $statusGula = 'Rendah (Hipoglikemia)';
                    } elseif ($gulaDarah > 125) {
                        $statusGula = 'Tinggi (Tidak Terkontrol)';
                    }

                    // Kategori Aktivitas Fisik
                    $opsiAktivitas = ['Jarang', 'Sedang', 'Aktif'];
                    $aktivitas = $opsiAktivitas[array_rand($opsiAktivitas)];

                    // Waktu periksa dibuat beberapa jam setelah kegiatan dimulai
                    $waktuPeriksa = $tanggalKegiatan->copy()->addHours(rand(1, 3))->addMinutes(rand(1, 59));

                    PemeriksaanModel::create([
                        'jadwal_kegiatan_id' => $jadwal->id,
                        'pesertaid'          => $peserta->id,
                        'berat_badan'        => $beratKg,
                        'tinggi_badan'       => $tinggiCm,
                        'imt'                => $imt,
                        'tensi_sistolik'     => $tensiSistolik,
                        'tensi_diastolik'    => $tensiDiastolik,
                        'gula_darah_puasa'   => $gulaDarah,
                        'status_gula_darah'  => $statusGula,
                        'aktivitas'          => $aktivitas,
                        'perawatid'          => 2, // Ganti dengan ID User Perawat yang valid di DB Anda
                        'dokterid'           => 1, // Ganti dengan ID User Dokter yang valid di DB Anda
                        'catatan_dokter'     => 'Pasien dalam kondisi stabil. Lanjutkan pengobatan rutin.',
                        'created_at'         => $waktuPeriksa,
                        'updated_at'         => $waktuPeriksa,
                    ]);
                }
            }
        }

        $this->command->info('Berhasil! Data Jadwal, Absen, dan Pemeriksaan 6 bulan terakhir telah di-generate.');
    }
}