<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // 1. Pastikan user sudah login
        if (!auth()->check()) {
            return response()->json([
                'message' => 'Unauthorized. Silakan login terlebih dahulu.'
            ], 401);
        }

        // 2. Ambil role user saat ini
        $userRole = auth()->user()->role;

        // 3. Selalu izinkan PIC Prolanis (Superadmin = 6) untuk mengakses semuanya
        if ($userRole == 6) {
            return $next($request);
        }

        // 4. Cek apakah role user ada di dalam daftar role yang diizinkan untuk route ini
        if (in_array($userRole, $roles)) {
            return $next($request);
        }

        // 5. Jika tidak cocok, tolak aksesnya
        return response()->json([
            'message' => 'Forbidden. Anda tidak memiliki hak akses ke halaman ini.'
        ], 403);
    }
}
