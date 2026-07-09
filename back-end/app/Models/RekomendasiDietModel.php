<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RekomendasiDietModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'pemeriksaanid',
        'giziid',
        'total_kalori_harian'
    ];

    public function petugas_gizi()
    {
        return $this->belongsTo(User::class, 'giziid', 'id');
    }

    public function pemeriksaanRekomendasiDiet()
    {
        return $this->belongsTo(PemeriksaanModel::class, 'pemeriksaanid', 'id');
    }

    public function rekomendasiDietDetail()
    {
        return $this->hasMany(RekomendasiDietModel::class, 'rekomendasiid');
    }
}
