<?php

namespace Database\Seeders;

use App\Models\PesertaProlanisModel;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class PesertaProlanisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        $namaLaki = [
            'Agus Setiawan',
            'Andi Saputra',
            'Budi Santoso',
            'Dedi Kurniawan',
            'Eko Prasetyo',
            'Fajar Hidayat',
            'Hendra Gunawan',
            'Irfan Maulana',
            'Joko Susilo',
            'Rizky Ramadhan',
            'Muhammad Iqbal',
            'Yusuf Kurnia',
            'Rudi Hartono',
            'Ahmad Fauzi',
            'Wahyu Nugroho',
        ];

        $namaPerempuan = [
            'Siti Aisyah',
            'Dewi Anggraini',
            'Rina Marlina',
            'Indah Permata',
            'Fitri Handayani',
            'Nur Aini',
            'Sri Wahyuni',
            'Lestari Wulandari',
            'Yuni Kartika',
            'Rika Amelia',
            'Putri Maharani',
            'Anisa Rahma',
            'Desi Puspita',
            'Novi Yanti',
            'Maya Sari',
        ];

        // Gabungkan menjadi 30 data
        $data = [];

        foreach ($namaLaki as $nama) {
            $data[] = [
                'nama' => $nama,
                'jenis_kelamin' => 'Pria',
            ];
        }

        foreach ($namaPerempuan as $nama) {
            $data[] = [
                'nama' => $nama,
                'jenis_kelamin' => 'Wanita',
            ];
        }

        foreach ($data as $peserta) {

            // Membuat nomor BPJS 13 digit
            $bpjs = '';

            for ($i = 0; $i < 13; $i++) {
                $bpjs .= rand(0, 9);
            }

            PesertaProlanisModel::create([
                'no_bpjs' => $bpjs,
                'nama' => $peserta['nama'],
                'jenis_kelamin' => $peserta['jenis_kelamin'],
                'tanggal_lahir' => $faker->dateTimeBetween('-75 years', '-45 years')->format('Y-m-d'),
                'alamat' => $faker->address,
                'no_hp' => '08' . $faker->numerify('##########'),
                'diagnosa' => 'Diabetes',
                'is_home_visit' => false,
            ]);
        }
    }
}