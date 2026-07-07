<?php

namespace App\Http\Controllers;

use App\Models\PesertaProlanisModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PesertaProlanisController extends Controller
{
    function tampilkanSemuaData(Request $request)
    {
        $search = $request->query('search');

        // Buat query builder
        $query = PesertaProlanisModel::query();

        // Jika ada parameter search, filter berdasarkan nama atau no_bpjs
        if ($search) {
            $query->where('nama', 'like', '%' . $search . '%')
                  ->orWhere('no_bpjs', 'like', '%' . $search . '%');
        }

        // Lakukan pagination pada hasil filter
        $peserta = $query->latest()->paginate(10);

        return response()->json($peserta);
    }

    public function tambahDataPeserta(Request $request)
    {
        // 1. Aturan Validasi
        $validator = Validator::make($request->all(), [
            'no_bpjs'  => 'required|numeric|digits:13|unique:peserta_prolanis_models,no_bpjs',
            'nama'     => 'required|string|max:255',
            'jenis_kelamin'=>'required',
            'usia' => 'required',
            'alamat'   => 'required|string',
            'no_hp'    => 'required|numeric|digits:12', // Pastikan format tabel database mendukung string/varchar untuk nomor HP agar angka 0 di depan tidak hilang
            'diagnosa' => 'required|string'
        ], [
            // Kustomisasi pesan error (opsional, agar bahasa Indonesia)
            'no_bpjs.digits' => 'Nomor BPJS harus tepat 13 digit.',
            'no_bpjs.required' => 'Nomor Bpjs tidak boleh kosong',
            'no_bpjs.unique' => 'Nomor BPJS ini sudah terdaftar.',
            'nama.required' => 'Nama tidak boleh kososng.',
            'jenis_kelamin.required' => 'Jenis kelamin tidak boleh kososng.',
            'usia.required' => 'Usia tidak boleh kososng.',
            'alamat.required' => 'Alamat tidak boleh kosong',
            'no_hp.required' => 'Nomor Hp tidak boleh kosong',
            'no_hp.digits'   => 'Nomor HP harus tepat 12 digit.',
            'diagnosa.required' => 'Diagnosa belum dipilih',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Simpan Data
        $peserta = PesertaProlanisModel::create($request->all());

        return response()->json([
            'message' => 'Data peserta berhasil disimpan!',
            'data' => $peserta
        ], 201);
    }

    public function updateDataPeserta(Request $request, $id)
    {
        $peserta = PesertaProlanisModel::find($id);

        if (!$peserta) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        // 1. Aturan Validasi (Perhatikan penambahan ,$id pada rule unique)
        $validator = Validator::make($request->all(), [
            // Ganti nama tabelnya sesuai dengan yang Anda gunakan di Cara 1 atau Cara 2 sebelumnya
            'no_bpjs'  => 'required|numeric|digits:13|unique:peserta_prolanis_models,no_bpjs,' . $id,
            'nama'     => 'required|string|max:255',
            'jenis_kelamin'=>'required',
            'usia' => 'required',
            'alamat'   => 'required|string',
            'no_hp'    => 'required|numeric|digits:12',
            'diagnosa' => 'required|string'
        ], [
            'no_bpjs.digits' => 'Nomor BPJS harus tepat 13 digit.',
            'no_bpjs.required' => 'Nomor Bpjs tidak boleh kosong',
            'no_bpjs.unique' => 'Nomor BPJS ini sudah terdaftar.',
            'nama.required' => 'Nama tidak boleh kososng.',
            'jenis_kelamin.required' => 'Jenis kelamin tidak boleh kososng.',
            'usia.required' => 'Usia tidak boleh kososng.',
            'alamat.required' => 'Alamat tidak boleh kosong',
            'no_hp.required' => 'Nomor Hp tidak boleh kosong',
            'no_hp.digits'   => 'Nomor HP harus tepat 12 digit.',
            'diagnosa.required' => 'Diagnosa belum dipilih',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Update Data
        $peserta->update($request->all());

        return response()->json([
            'message' => 'Data peserta berhasil diperbarui!',
            'data' => $peserta
        ], 200);
    }

    public function hapusDataPeserta($id)
    {
        $peserta = PesertaProlanisModel::find($id);

        if (!$peserta) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        // Hapus data dari database
        $peserta->delete();

        return response()->json([
            'message' => 'Data peserta berhasil dihapus!'
        ], 200);
    }
}
