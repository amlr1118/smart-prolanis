<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbsenModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'kegiatanid',
        'pesertaid',
        'status_kehadiran',
        'stasiun',

    ];

    protected $casts = [
        'status_kehadiran' => 'boolean',
    ];

    public function relasikeKegiatan()
    {
        return $this->belongsTo(JadwalKegiatanModel::class, 'kegiatanid', 'id');
    }

    public function relasikePeserta()
    {
        return $this->belongsTo(PesertaProlanisModel::class, 'pesertaid', 'id');
    }
}
