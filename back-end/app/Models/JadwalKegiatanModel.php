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
        'lokasi',
    ];


    public function relasiKegiatanKeUser(){
        return $this->belongsTo(User::class,'petugasid','id');
    }

    public function relasikeAbsen(){
        return $this->hasMany(AbsenModel::class, 'kegiatanid');
    }
}
