<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResepObatModel extends Model
{
    use HasFactory;

    protected $table = 'resep_obat_models';

    protected $fillable = [
        'pemeriksaan_id',
        'nama_obat',
        'dosis',
        'jumlah',
        'keterangan',
        'status_tebus',
        'apotekerid'
    ];

    // Relasi balik ke Pemeriksaan
    public function RelasikePemeriksaan()
    {
        return $this->belongsTo(PemeriksaanModel::class, 'pemeriksaan_id');
    }

    // Relasi ke Apoteker yang menyerahkan
    public function apoteker()
    {
        return $this->belongsTo(User::class, 'apotekerid');
    }
}