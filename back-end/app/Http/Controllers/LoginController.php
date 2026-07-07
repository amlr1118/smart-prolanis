<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Buat query builder
        $query = User::query();

        // Jika ada parameter search, filter berdasarkan nama atau no_bpjs
        if ($search) {
            $query->where('userid', 'like', '%' . $search . '%')
                ->orWhere('name', 'like', '%' . $search . '%');
        }

        // Lakukan pagination pada hasil filter
        $pengguna = $query->latest()->paginate(10);

        return response()->json($pengguna);
    }

    public function updateDataPengguna(Request $request, $id)
    {
        $pengguna = User::find($id);

        if (!$pengguna) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'userid' => 'required',
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
            'role' => 'required',

            'password' => [
                'required',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
            ],

        ], [
            'userid.required' => 'Nomor identitas tidak boleh kosong',
            'email.required' => 'Email tidak boleh kosong.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar.',

            'name.required' => 'Nama tidak boleh kosong.',

            'role.required' => 'Role tidak boleh kosong.',

            'password.required' => 'Password tidak boleh kosong.',
            'password.max' => 'Password maksimal 8 karakter.',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Simpan data dengan password terenkripsi

        $pengguna->update([
            'userid' => $request->userid,
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Data Pengguna berhasil diupdate!',
            'data' => $pengguna
        ], 201);
    }

    public function hapusDataPengguna($id)
    {
        $pengguna = User::find($id);

        if (!$pengguna) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        // Hapus data dari database
        $pengguna->delete();

        return response()->json([
            'message' => 'Data peserta berhasil dihapus!'
        ], 200);
    }


    public function register(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'userid' => 'required',
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
            'role' => 'required',

            'password' => [
                'required',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
            ],

        ], [
            'userid.required' => 'Nomor identitas tidak boleh kosong',
            'email.required' => 'Email tidak boleh kosong.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar.',

            'name.required' => 'Nama tidak boleh kosong.',

            'role.required' => 'Role tidak boleh kosong.',

            'password.required' => 'Password tidak boleh kosong.',
            'password.max' => 'Password maksimal 8 karakter.',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Simpan data dengan password terenkripsi
        $pengguna = User::create([
            'userid' => $request->userid,
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Data Pengguna berhasil disimpan!',
            'data' => $pengguna
        ], 201);
    }

    public function login(Request $request)
    {
        $validasi = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return [
                'errors' => [
                    'email' => ['Email dan password tidak cocok !']
                ]
            ];
        }

        $token = $user->createToken($user->name);

        //Auth::login($user);

        return [
            'user' => $user,
            'token' => $token->plainTextToken
        ];
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return [
            'message' => 'You are logged out.'
        ];
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['message' => 'User updated successfully']);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
