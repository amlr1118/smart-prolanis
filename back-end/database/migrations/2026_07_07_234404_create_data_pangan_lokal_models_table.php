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
        Schema::create('data_pangan_lokal_models', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pangan');
            $table->string('kategori');
            $table->float('kalori_per_100g');
            $table->float('karbo_per_100g');
            $table->string('satuan_porsi');
            $table->integer('berat_per_porsi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_pangan_lokal_models');
    }
};
