<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PesertaProlanisModel;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class PesertaProlanisModelFactory extends Factory
{

    protected $model = PesertaProlanisModel::class;


    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Membuat tepat 13 digit angka acak untuk BPJS
            'no_bpjs' => $this->faker->numerify('#############'),

            // Nama acak
            'nama' => $this->faker->name(),

            // Alamat acak
            'alamat' => $this->faker->address(),

            // Format nomor HP Indonesia (diawali 08 dan diikuti 9-11 angka acak)
            'no_hp' => $this->faker->numerify('08###########'),

            // Memilih secara acak antara Diabetes atau Hipertensi
            'diagnosa' => $this->faker->randomElement(['Diabetes', 'Hipertensi']),

        ];
    }
}
