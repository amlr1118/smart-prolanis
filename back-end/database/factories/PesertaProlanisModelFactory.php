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

            'no_bpjs' => $this->faker->numerify('#############'),

            'nama' => $this->faker->name(),

            'jenis_kelamin' => $this->faker->randomElement([
                'Laki-laki',
                'Perempuan'
            ]),

            'usia' => $this->faker->numberBetween(45, 75),

            'alamat' => $this->faker->address(),

            'no_hp' => $this->faker->numerify('08##########'),

            'diagnosa' => 'Diabetes',
        ];
    }
}
