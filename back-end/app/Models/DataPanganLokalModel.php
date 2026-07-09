<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataPanganLokalModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_pangan',
        'kategori',
        'kalori_per_100g',
        'karbo_per_100g',
        'satuan_porsi',
        'berat_per_porsi',

    ];

    public function panganData()
    {
        return $this->hasMany(DetailRekomendasiDietModel::class, 'paganid');
    }
}
