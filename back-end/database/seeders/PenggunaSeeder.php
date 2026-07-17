<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PenggunaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'userid' => '100001',
                'name' => 'Andi Saputra',
                'role' => '1',
            ],
            [
                'userid' => '100002',
                'name' => 'Budi Santoso',
                'role' => '2',
            ],
            [
                'userid' => '100003',
                'name' => 'Citra Lestari',
                'role' => '3',
            ],
            [
                'userid' => '100004',
                'name' => 'Dewi Anggraini',
                'role' => '4',
            ],
            [
                'userid' => '100005',
                'name' => 'Eko Prasetyo',
                'role' => '5',
            ],
            [
                'userid' => '100006',
                'name' => 'Fajar Hidayat',
                'role' => '6',
            ],
        ];

        foreach ($users as $user) {

            // Ambil nama depan untuk email
            $firstName = strtolower(explode(' ', $user['name'])[0]);

            User::create([
                'userid' => $user['userid'],
                'name' => $user['name'],
                'role' => $user['role'],
                'email' => $firstName . '@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('Qwerty123@'),
                'avatar' => null,
                'remember_token' => Str::random(10),
            ]);
        }
    }
}
