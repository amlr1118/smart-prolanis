<?php

namespace App\Http\Controllers;

use App\Models\PemeriksaanModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PemeriksaanController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = PemeriksaanModel::with([
            'peserta',
            'dokter',
            'perawat'
        ]);

        if ($search) {

            $query->whereHas('peserta', function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('no_bpjs', 'like', "%{$search}%");
            })
                ->orWhereHas('dokter', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('perawat', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        $data = $query->latest()->paginate(10);

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [


        ], [

        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Simpan data dengan password terenkripsi
        $data = PemeriksaanModel::create([

        ]);

        return response()->json([
            'message' => 'Data Pemeriksaan berhasil disimpan!',
            'data' => $data
        ], 201);
    }
}
