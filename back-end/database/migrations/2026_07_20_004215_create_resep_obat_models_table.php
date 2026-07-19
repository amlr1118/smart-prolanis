<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resep_obat_models', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke Pemeriksaan (Stasiun 2 & 3)
            $table->unsignedBigInteger('pemeriksaan_id');
            
            // Detail Obat
            $table->string('nama_obat');
            $table->string('dosis'); // Contoh: "3 x 1"
            $table->integer('jumlah'); // Contoh: 30
            $table->string('keterangan')->nullable(); // Contoh: "Sesudah makan"
            
            // Status Pengambilan Obat (Untuk Apoteker - Role 4)
            // 0 = Menunggu diambil, 1 = Sudah diserahkan
            $table->tinyInteger('status_tebus')->default(0);
            
            // Siapa Apoteker yang menyerahkan? (Opsional, diisi saat status_tebus = 1)
            $table->unsignedBigInteger('apotekerid')->nullable();

            $table->timestamps();

            // Relasi ke tabel pemeriksaan
            $table->foreign('pemeriksaan_id')
                  ->references('id')
                  ->on('pemeriksaan_models')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');

            // Relasi ke tabel users (Apoteker)
            $table->foreign('apotekerid')
                  ->references('id')
                  ->on('users')
                  ->onUpdate('cascade')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resep_obat_models');
    }
};