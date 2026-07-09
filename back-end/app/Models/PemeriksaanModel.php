<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PemeriksaanModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'pesertaid',
        'perawatid',
        'dokterid',
        'berat_badan',
        'tinggi_badan',
        'imt',
        'tensi_sistolik',
        'tensi_diastolik',
        'gula_darah_puasa',
        'status_gula_darah',
        'aktivitas',
    ];

    public function peserta()
    {
        return $this->belongsTo(PesertaProlanisModel::class, 'pesertaid');
    }

    public function perawat()
    {
        return $this->belongsTo(User::class, 'perawatid','id');
    }

    public function dokter()
    {
        return $this->belongsTo(User::class, 'dokterid','id');
    }

    public function rekomendasiDiet(){
        return $this->hasMany(RekomendasiDietModel::class, 'pemeriksaanid');
    }
}
