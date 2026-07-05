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
        'alamat',
        'no_hp',
        'diagnosa',
    ];
}
