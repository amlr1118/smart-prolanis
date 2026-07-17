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

        $query = JadwalKegiatanModel::with([
            'relasiKegiatanKeUser',
        ]);

        if ($search) {
            $query->where('nama_kegiatan', 'like', '%' . $search . '%')
                ->orWhere('jenis_kegiatan', 'like', '%' . $search . '%');
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

        return response()->json([
            'message' => 'Data jadwal kegiatan berhasil diupdate!',
            'data' => $data,

        ], 201);
    }
}
