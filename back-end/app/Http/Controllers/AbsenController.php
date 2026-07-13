<?php

namespace App\Http\Controllers;

use App\Http\Resources\AbsenResource;
use App\Models\AbsenModel;
use App\Models\JadwalKegiatanModel;
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
}
