<?php

namespace Database\Seeders;

use App\Models\ModelPemesananBarang;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PemesananBarangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userid = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
        $faker = Faker::create('id_ID');

        for ($i = 1; $i <= 50; $i++) {
            ModelPemesananBarang::create([
                'userid' => $userid[array_rand($userid)],
                'kode_transaksi' => Str::random(10),
                'nama_pengirim' => $faker->name(),
                'nomor_hp' => $faker->phoneNumber,
                'alamat_pengiriman' => $faker->address,
                'foto_produk'=> Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }


//        DB::table('model_pemesanan_barangs')->insert([
//            [
//                'userid' => 1,
//                'kode_transaksi' => 'TRX001',
//                'nama_pengirim' => 'Andi Saputra',
//                'nomor_hp' => '081234567890',
//                'alamat_pengiriman' => 'Jl. Merdeka No.1, Jakarta',
//                'created_at' => now(),
//                'updated_at' => now(),
//            ],
//            [
//                'userid' => 3,
//                'kode_transaksi' => 'TRX002',
//                'nama_pengirim' => 'Siti Aminah',
//                'nomor_hp' => '082112345678',
//                'alamat_pengiriman' => 'Jl. Sudirman No.45, Bandung',
//                'created_at' => now(),
//                'updated_at' => now(),
//            ],
//            [
//                'userid' => 1,
//                'kode_transaksi' => 'TRX003',
//                'nama_pengirim' => 'Budi Hartono',
//                'nomor_hp' => '085612345678',
//                'alamat_pengiriman' => 'Jl. Diponegoro No.12, Surabaya',
//                'created_at' => now(),
//                'updated_at' => now(),
//            ],
//        ]);
    }
}
