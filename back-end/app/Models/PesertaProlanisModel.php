<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PesertaProlanisModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_bpjs',
        'nama',
        'jenis_kelamin',
        'tanggal_lahir',
        'alamat',
        'no_hp',
        'diagnosa',
    ];

    public function pemeriksaans()
    {
        return $this->hasMany(PemeriksaanModel::class, 'pesertaid');
    }

    public function relasikeAbsen()
    {
        return $this->hasMany(AbsenModel::class, 'pesertaid','id');
    }
}
