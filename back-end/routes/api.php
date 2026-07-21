<?php

use App\Http\Controllers\AbsenController;
use App\Http\Controllers\ArsipKegiatanController;
use App\Http\Controllers\JadwalKegiatanController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\PemeriksaanController;
use App\Http\Controllers\PesertaProlanisController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

//Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//    return $request->user();
//});

Route::post('/login', [LoginController::class, 'login']);


Route::middleware(['auth:sanctum'])->group(function () {

    //bisa di akses oleh semua role
    Route::get('/user', function (Request $request) {
        return $request->user(); // INI YANG BENAR;
    });
    Route::post('/logout', [LoginController::class, 'logout']);

    Route::middleware('role:6')->group(function () {
        //Hanya bisa di akses PIC Prolanis
        Route::get('/pengguna', [LoginController::class, 'index']);
        Route::put('/update-pengguna/{id}', [LoginController::class, 'updateDataPengguna']);
        Route::delete('/hapus-pengguna/{id}', [LoginController::class, 'hapusDataPengguna']);
        Route::post('/register', [LoginController::class, 'register']);
        Route::put('/users/{id}', [LoginController::class, 'update']);
        Route::delete('/users/{id}', [LoginController::class, 'destroy']);
    });


    Route::middleware('role:5,6')->group(function () {
        //hanya bisa di akses oleh administrasi dan PIC prolanis
        Route::get('/peserta-prolanis', [PesertaProlanisController::class, 'tampilkanSemuaData']);
        Route::post('/tambah-peserta-prolanis', [PesertaProlanisController::class, 'tambahDataPeserta']);
        Route::put('/update-peserta-prolanis/{id}', [PesertaProlanisController::class, 'updateDataPeserta']);
        Route::delete('/hapus-peserta-prolanis/{id}', [PesertaProlanisController::class, 'hapusDataPeserta']);
        Route::get('/jadwal-kegiatan', [JadwalKegiatanController::class, 'index']);
        Route::post('/simpan-jadwal-kegiatan', [JadwalKegiatanController::class, 'store']);
        Route::put('/update-jadwal-kegiatan/{id}', [JadwalKegiatanController::class, 'update']);
        Route::delete('/hapus-jadwal-kegiatan/{id}', [JadwalKegiatanController::class, 'destroy']);
        Route::put('/update-status-kegiatan/{id}', [JadwalKegiatanController::class, 'updateStatusKegiatan']);
        Route::get('/jadwal-kegiatan-aktif', [JadwalKegiatanController::class, 'tampilDataKegiatanAktif']);
        Route::post('/upsert-absensi', [AbsenController::class, 'upsertAbsensi']);
        Route::get('/get-peserta-absensi/{kegiatanId}', [AbsenController::class, 'getPesertaAbsensi']);
        Route::get('/absen', [AbsenController::class, 'index']);
        Route::get('/arsip-kegiatan', [ArsipKegiatanController::class, 'index']);
    });

    Route::middleware('role:5')->group(function () {
        //hanya bisa di akses oleh administrasi
        Route::get('/statistik-jadwal', [JadwalKegiatanController::class, 'widgetDashboardKader']);
    });

    Route::middleware('role:1,2,6')->group(function () {

        // Rute GET untuk menarik data peserta di tabel
        Route::get('/pemeriksaan-fisik/peserta-hadir/{kegiatanId}', [PemeriksaanController::class, 'getPesertaHadir']);

        // Rute POST untuk menyimpan/update form TTV
        Route::post('/upsert-pemeriksaan', [PemeriksaanController::class, 'upsertPemeriksaan']);
    });
});
