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
        Schema::create('detail_rekomendasi_diet_models', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rekomendasiid');
            $table->unsignedBigInteger('panganid');
            $table->string('waktu_makan');
            $table->float('jumlah_porsi');
            $table->timestamps();

            $table->foreign('rekomendasiid')
                ->references('id')
                ->on('rekomendasi_diet_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            
             $table->foreign('panganid')
                ->references('id')
                ->on('data_pangan_lokal_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_rekomendasi_diet_models');
    }
};
