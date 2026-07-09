<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailRekomendasiDietModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'rekomendasiid',
        'paganid',
        'waktu_makan',
        'jumlah_porsi',

    ];

    public function detailRekomendasiDiet()
    {
        return $this->belongsTo(RekomendasiDietModel::class, 'rekomendasiid', 'id');
    }

    public function dataPangan()
    {
        return $this->belongsTo(DataPanganLokalModel::class, 'paganid', 'id');
    }
}
