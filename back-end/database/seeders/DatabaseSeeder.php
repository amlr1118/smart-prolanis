<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\PesertaProlanisModel;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        //  \App\Models\User::factory(20)->create();
        // PesertaProlanisModel::factory(50)->create();

        $this->call([
            PenggunaSeeder::class,
            PesertaProlanisSeeder::class,
        ]);
    }

}
