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
        Schema::create('absen_models', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('kegiatanid');
            $table->unsignedBigInteger('pesertaid');
            $table->boolean('status_kehadiran')->default(false);
            $table->string('stasiun');
            $table->timestamps();


            $table->foreign('kegiatanid')
                ->references('id')
                ->on('jadwal_kegiatan_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');

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
        Schema::dropIfExists('absen_models');
    }
};
