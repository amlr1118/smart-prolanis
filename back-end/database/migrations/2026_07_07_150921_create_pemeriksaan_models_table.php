<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\table;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pemeriksaan_models', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pesertaid');
            $table->unsignedBigInteger('perawatid');
            $table->unsignedBigInteger('dokterid');
            $table->float('berat_badan');
            $table->float('tinggi_badan');
            $table->float('imt');
            $table->integer('tensi_sistolik');
            $table->integer('tensi_diastolik');
            $table->integer('gula_darah_puasa');
            $table->string('status_gula_darah');
            $table->timestamps();

            // Relasi ke tabel users
            $table->foreign('perawatid')
                  ->references('id')
                  ->on('users')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');

            $table->foreign('dokterid')
                  ->references('id')
                  ->on('users')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');

            // Jika pesertaid mengarah ke tabel peserta_models
            $table->foreign('pesertaid')
                  ->references('id')
                  ->on('peserta_prolanis_models')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_models');
    }
};
