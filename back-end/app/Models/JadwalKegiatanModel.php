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

    public function RelasiJadwalKePemeriksaan()
    {
        return $this->hasMany(JadwalKegiatanModel::class, 'jadwal_kegiatan_id');
    }
}
