<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'userid',
        'name',
        'role',
        'email',
        'password',
    ];

    // Sebagai dokter
    public function pemeriksaanSebagaiDokter()
    {
        return $this->hasMany(PemeriksaanModel::class, 'dokterid');
    }

    // Sebagai perawat
    public function pemeriksaanSebagaiPerawat()
    {
        return $this->hasMany(PemeriksaanModel::class, 'perawatid');
    }

    public function pemeriksaanSebagaiGizi()
    {
        return $this->hasMany(RekomendasiDietModel::class, 'giziid');
    }

     public function relasiUserkeKegiatan(){
        return $this->hasMany(JadwalKegiatanModel::class,'petugasid');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
