<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rekomendasi_diet_models', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pemeriksaanid');
            $table->unsignedBigInteger('giziid');
            $table->integer('total_kalori_harian');
            $table->timestamps();

            $table->foreign('giziid')
                ->references('id')
                ->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            
             $table->foreign('pemeriksaanid')
                ->references('id')
                ->on('pemeriksaan_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekomendasi_diet_models');
    }
};
