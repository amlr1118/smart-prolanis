<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalKegiatanModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'petugasid',
        'nama_kegiatan',
        'jenis_kegiatan',
        'tanggal',
        'lokasi',
        'status',
        'is_active',
    ];


    public function relasiKegiatanKeUser()
    {
        return $this->belongsTo(User::class, 'petugasid', 'id');
    }

    public function relasikeAbsen()
    {
        return $this->hasMany(AbsenModel::class, 'kegiatanid');
    }

    // KODE SEBELUMNYA SALAH (JadwalKegiatanModel::class)
    public function RelasiJadwalKePemeriksaan()
    {
        // Ubah menjadi PemeriksaanModel::class
        return $this->hasMany(PemeriksaanModel::class, 'jadwal_kegiatan_id');
    }
}
