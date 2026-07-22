<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('pemeriksaan_models', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('jadwal_kegiatan_id'); // <-- TAMBAHAN WAJIB
        $table->unsignedBigInteger('pesertaid');
        $table->unsignedBigInteger('perawatid'); // Bisa diisi nanti
        $table->unsignedBigInteger('dokterid')->nullable(); // Diisi saat Stasiun 3
        
        $table->float('berat_badan');
        $table->float('tinggi_badan');
        $table->float('imt');
        $table->integer('tensi_sistolik');
        $table->integer('tensi_diastolik');
        $table->integer('gula_darah_puasa');
        $table->string('status_gula_darah');
        $table->string('aktivitas');
        $table->string('catatan_dokter')->nullable(); // Ubah dari default(null) ke nullable()
        
        $table->timestamps();

        // Relasi Jadwal
        $table->foreign('jadwal_kegiatan_id')->references('id')->on('jadwal_kegiatan_models')->onDelete('cascade');
        
        // Relasi Users & Peserta
        $table->foreign('perawatid')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('dokterid')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('pesertaid')->references('id')->on('peserta_prolanis_models')->onDelete('cascade');
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
