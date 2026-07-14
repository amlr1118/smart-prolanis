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
        Schema::create('jadwal_kegiatan_models', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('petugasid');
            $table->string('nama_kegiatan');
            $table->string('jenis_kegiatan');
            $table->date('tanggal');
            $table->string('lokasi');
            $table->boolean('status')->default(false);
            $table->timestamps();

            $table->foreign('petugasid')
                ->references('id')
                ->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_kegiatan_models');
    }
};
