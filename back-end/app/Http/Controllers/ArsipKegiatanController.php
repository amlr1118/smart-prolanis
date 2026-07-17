<?php

namespace App\Http\Controllers;

use App\Models\JadwalKegiatanModel;
use Illuminate\Http\Request;

class ArsipKegiatanController extends Controller
{
    //
    public function index(Request $request)
    {
        // Tangkap parameter dari React (default page=1, per_page=10, search=kosong)
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);

        // Mulai query khusus untuk arsip (status = 2)
        $query = JadwalKegiatanModel::where('status', '2')
            ->withCount([
                // Hitung yang hadir (status_kehadiran = 1)
                'relasikeAbsen as hadir_count' => function ($q) {
                    $q->where('status_kehadiran', 1);
                },
                // Hitung total peserta yang diabsen
                'relasikeAbsen as total_peserta_count'
            ]);

        // Logika Pencarian
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_kegiatan', 'like', "%{$search}%")
                    ->orWhere('lokasi', 'like', "%{$search}%")
                    ->orWhere('tanggal', 'like', "%{$search}%");
            });
        }

        // Urutkan dari yang terbaru, lalu eksekusi pagination
        $arsip = $query->orderBy('tanggal', 'desc')->paginate($perPage);

        return response()->json($arsip, 200);
    }

}
