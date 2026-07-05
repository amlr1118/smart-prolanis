<?php

use App\Http\Controllers\LoginController;
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
    Route::get('/user', function (Request $request) {
       return $request->user(); // INI YANG BENAR;
    });


    Route::post('/logout', [LoginController::class, 'logout']);

    Route::post('/register', [LoginController::class, 'register']);
    Route::put('/users/{id}', [LoginController::class, 'update']);
    Route::delete('/users/{id}', [LoginController::class, 'destroy']);

    Route::get('/peserta-prolanis', [PesertaProlanisController::class, 'tampilkanSemuaData']);
    Route::post('/tambah-peserta-prolanis', [PesertaProlanisController::class, 'tambahDataPeserta']);
    Route::put('/update-peserta-prolanis/{id}', [PesertaProlanisController::class, 'updateDataPeserta']);
    Route::delete('/hapus-peserta-prolanis/{id}', [PesertaProlanisController::class, 'hapusDataPeserta']);

});

