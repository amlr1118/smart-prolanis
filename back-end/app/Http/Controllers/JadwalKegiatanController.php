<?php

namespace App\Http\Controllers;

use App\Http\Resources\JadwalKegiatanResource;
use App\Models\AbsenModel;
use App\Models\JadwalKegiatanModel;
use App\Models\PesertaProlanisModel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class JadwalKegiatanController extends Controller
{
    //

    public function index(Request $request)
    {
        $search = $request->query('search');

        // 1. Tambahkan whereIn untuk membatasi status hanya 0 (Mendatang) atau 1 (Berlangsung)
        $query = JadwalKegiatanModel::with([
            'relasiKegiatanKeUser',
        ])->whereIn('status', ['0', '1']);

        // 2. Bungkus query pencarian di dalam function agar orWhere tidak merusak filter status
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_kegiatan', 'like', '%' . $search . '%')
                    ->orWhere('jenis_kegiatan', 'like', '%' . $search . '%');
            });
        }

        // Lakukan pagination pada hasil filter
        $data = $query->latest()->paginate(10);

        return JadwalKegiatanResource::collection($data);
    }
    public function store(Request $request)
    {
        // 1. Aturan Validasi
        $validator = Validator::make($request->all(), [
            'nama_kegiatan' => 'required|string|max:255',
            'jenis_kegiatan' => 'required|string',
            'tanggal' => 'required',
            'lokasi' => 'required|string',
            // 'status' => 'required',
        ], [
            // Kustomisasi pesan error (opsional, agar bahasa Indonesia)
            'nama_kegiatan.required' => 'Nama kegiatan tidak boleh kososng.',
            'jenis_kegiatan.required' => 'Jenis kegiatan tidak boleh kososng.',
            'tanggal.required' => 'Jenis kegiatan tidak boleh kososng.',
            'lokasi.required' => 'Lokasi tidak boleh kososng.',
            //'status.required' => 'Status kegiatan tidak boleh kososng.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $idUser = Auth::id();

        // 2. Simpan Data
        $peserta = JadwalKegiatanModel::create([
            'petugasid' => $idUser,
            'nama_kegiatan' => $request->nama_kegiatan,
            'jenis_kegiatan' => $request->jenis_kegiatan,
            'tanggal' => $request->tanggal,
            'lokasi' => $request->lokasi,
            //'status' => $request->status,
        ]);


        // $this->pesertaAbsen();

        return response()->json([
            'message' => 'Data jadwal kegiatan berhasil disimpan!',
            'data' => $peserta
        ], 201);
    }

    public function pesertaAbsen()
    {
        $dataPeserta = PesertaProlanisModel::all();

        $kegiatanid = JadwalKegiatanModel::where('status', true)->first();

        $stasiun = Auth::user()->role;

        foreach ($dataPeserta as $data) {
            AbsenModel::create([
                'kegiatanid' => $kegiatanid->id,
                'pesertaid' => $data->id,
                'stasiun' => $stasiun,
            ]);
        }
    }


    public function update(Request $request, $id)
    {

        $data = JadwalKegiatanModel::find($id);

        $validator = Validator::make($request->all(), [
            'nama_kegiatan' => 'required|string|max:255',
            'jenis_kegiatan' => 'required|string',
            'tanggal' => 'required',
            'lokasi' => 'required|string',
            //'status' => 'required',
        ], [
            // Kustomisasi pesan error (opsional, agar bahasa Indonesia)
            'nama_kegiatan.required' => 'Nama kegiatan tidak boleh kososng.',
            'jenis_kegiatan.required' => 'Jenis kegiatan tidak boleh kososng.',
            'tanggal.required' => 'Jenis kegiatan tidak boleh kososng.',
            'lokasi.required' => 'Lokasi tidak boleh kososng.',
            //'status.required' => 'Status kegiatan tidak boleh kososng.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Simpan Data
        $data->update([
            'nama_kegiatan' => $request->nama_kegiatan,
            'jenis_kegiatan' => $request->jenis_kegiatan,
            'tanggal' => $request->tanggal,
            'lokasi' => $request->lokasi,
        ]);

        return response()->json([
            'message' => 'Data jadwal kegiatan berhasil diupdate!',
            'data' => $data,

        ], 201);
    }

    public function destroy($id)
    {
        $data = JadwalKegiatanModel::find($id);

        if (!$data) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        // Hapus data dari database
        $data->delete();

        return response()->json([
            'message' => 'Data jadwal kegiatan berhasil dihapus!'
        ], 200);
    }

    public function tampilDataKegiatanAktif()
    {
        $hariIni = Carbon::today()->toDateString();

        // 2. (Opsional tapi penting) Matikan semua kegiatan yang jadwalnya BUKAN hari ini.
        // Ini mencegah penumpukan data aktif dari kegiatan hari-hari sebelumnya.
        JadwalKegiatanModel::whereDate('tanggal', '!=', $hariIni)
            ->update(['is_active' => false]);

        // 3. Update is_active menjadi true untuk kegiatan yang jadwalnya HARI INI.
        JadwalKegiatanModel::whereDate('tanggal', $hariIni)
            ->where('status', "0")
            ->update(['is_active' => true]);

        // 4. Ambil data kegiatan yang sekarang berstatus aktif
        $data = JadwalKegiatanModel::with('relasiKegiatanKeUser')
            ->where('is_active', true)
            ->get();

        // 5. Kembalikan data melalui Resource Collection
        return JadwalKegiatanResource::collection($data);
    }

    public function updateStatusKegiatan(Request $request, $id)
    {
        $data = JadwalKegiatanModel::find($id);


        // 2. Simpan Data
        $data->update([
            'status' => $request->status,
            'is_active' => $request->is_active,
        ]);

        // LAKUKAN LOGIKA OTOMATIS JIKA KEGIATAN DINYATAKAN "SELESAI" (Status "2")
        if ($request->status == "2") {

            // 1. Ambil SEMUA ID Peserta Prolanis yang aktif saat ini
            $semuaPesertaIds = PesertaProlanisModel::pluck('id')->toArray();

            // 2. Ambil ID Peserta yang SUDAH memiliki data absen (entah Hadir atau Alpa) di kegiatan ini
            $pesertaSudahAbsenIds = AbsenModel::where('kegiatanid', $id)
                ->pluck('pesertaid')
                ->toArray();

            // 3. Cari selisihnya (Peserta yang sama sekali belum disentuh/diklik oleh kader)
            // array_diff akan menghasilkan ID peserta yang TIDAK ADA di tabel absen
            $pesertaBelumAbsenIds = array_diff($semuaPesertaIds, $pesertaSudahAbsenIds);

            // 4. Siapkan keranjang data untuk Bulk Insert (Agar database tidak berat)
            $dataInsertOtomatis = [];
            $waktuSekarang = Carbon::now();

            foreach ($pesertaBelumAbsenIds as $pesertaId) {
                $dataInsertOtomatis[] = [
                    'kegiatanid' => $id,
                    'pesertaid' => $pesertaId,
                    'status_kehadiran' => 0, // 0 = Alpa
                    'stasiun' => 'Sistem - Otomatis', // Penanda bahwa data ini di-generate oleh sistem
                    'created_at' => $waktuSekarang,
                    'updated_at' => $waktuSekarang,
                ];
            }

            // 5. Masukkan semuanya ke database sekaligus (Bulk Insert)
            if (!empty($dataInsertOtomatis)) {
                AbsenModel::insert($dataInsertOtomatis);
            }
        }

        return response()->json([
            'message' => 'Data jadwal kegiatan berhasil diupdate!',
            'data' => $data,

        ], 201);
    }

    public function widgetDashboardKader()
    {
        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;

        $widget = [
            'total_jadwal' => JadwalKegiatanModel::whereMonth('tanggal', $bulanIni)
                ->whereYear('tanggal', $tahunIni)->count(),
            'selesai' => JadwalKegiatanModel::whereMonth('tanggal', $bulanIni)
                ->whereYear('tanggal', $tahunIni)
                ->where('status', '2')->count(),
            'mendatang' => JadwalKegiatanModel::whereMonth('tanggal', $bulanIni)
                ->whereYear('tanggal', $tahunIni)
                ->where('status', '0')->count(),
        ];

        // Response langsung berupa object JSON sesuai yang diharapkan React
        return response()->json($widget);
    }
}
