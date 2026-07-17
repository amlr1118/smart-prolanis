<?php

namespace App\Http\Controllers;

use App\Http\Resources\AbsenResource;
use App\Models\AbsenModel;
use App\Models\JadwalKegiatanModel;
use App\Models\PesertaProlanisModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AbsenController extends Controller
{
    //
    public function index(Request $request){
        $search = $request->query('search');

        $query = AbsenModel::with([
            'relasikeKegiatan',
            'relasikePeserta',
        ]);

        if ($search) {

            $query->whereHas('relasikeKegiatan', function ($q) use ($search) {
                $q->where('nama_kegiatan', 'like', "%{$search}%")
                    ->orWhere('jenis_kegiatan', 'like', "%{$search}%");
            })
                ->orWhereHas('relasikePeserta', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('no_bpjs', 'like', "%{$search}%");
                });
        }

        // Lakukan pagination pada hasil filter
        $data = $query->latest()->paginate(10);

        return AbsenResource::collection($data);
    }

    public function store(Request $request){

        
    }


    public function update(Request $request, $id){

        
    }

    public function destroy($id){
      
    }

    public function getPesertaAbsensi($kegiatanId)
    {
        // 1. Validasi keberadaan jadwal kegiatan
        $jadwal = JadwalKegiatanModel::find($kegiatanId);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal kegiatan tidak ditemukan'], 404);
        }

        // 2. Mengambil semua peserta Prolanis. 
        // Menggunakan fitur Eager Loading untuk menempelkan data absensi
        // HANYA yang berkaitan dengan $kegiatanId yang sedang dibuka.
        $peserta = PesertaProlanisModel::with(['relasikeAbsen' => function ($query) use ($kegiatanId) {
            $query->where('kegiatanid', $kegiatanId);
        }])->get();

        return response()->json([
            'message' => 'Data peserta berhasil dimuat.',
            'jadwal' => $jadwal,
            'data_peserta' => $peserta
        ], 200);
    }

    public function upsertAbsensi(Request $request)
    {
        // 1. Validasi input dari React
        // $validator = Validator::make($request->all(), [
        //     'kegiatanid' => 'required|exists:jadwal_kegiatan_models,id',
        //     'pesertaid' => 'required|exists:peserta_prolanis_models,id',
        //     'status_kehadiran' => 'required|boolean',
        // ]);

        // if ($validator->fails()) {
        //     return response()->json(['errors' => $validator->errors()], 422);
        // }

        // 2. Mengambil role petugas yang sedang login (Kader/Perawat)
        // Jika tidak menggunakan auth(), bisa diganti dengan string statis untuk sementara
        $stasiunRole = Auth::check() ? Auth::user()->role : 'Kader'; 

        // 3. Upsert Logika (Update atau Create)
        // Cari data berdasarkan kombinasi kegiatanid dan pesertaid
        // Jika ada, perbarui status_kehadiran. Jika tidak ada, buat baris baru.
        $absen = AbsenModel::updateOrCreate(
            [
                'kegiatanid' => $request->kegiatanid,
                'pesertaid' => $request->pesertaid,
            ],
            [
                'status_kehadiran' => $request->status_kehadiran,
                'stasiun' => $stasiunRole, 
            ]
        );

        return response()->json([
            'message' => 'Status absensi berhasil diperbarui!',
            'data' => $absen
        ], 200);
    }
}
