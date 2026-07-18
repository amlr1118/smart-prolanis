import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

// 1. Import PageMeta untuk mengatur Title Browser
import PageMeta from "../../components/common/PageMeta";
// 2. Import Swal untuk pesan error yang lebih jelas
import Swal from "sweetalert2";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await api.post("/login", formData);
      const { token, user } = res.data;

      login(token, user);

      // Jika berhasil, arahkan ke Dashboard
      navigate("/");
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 422) {
          setErrors(error.response.data.errors);
        } else if (error.response.status === 401) {
          // SweetAlert SEKARANG AKAN MUNCUL dengan aman!
          Swal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text:
              error.response.data.message ||
              "Email atau kata sandi yang Anda masukkan salah!",
            confirmButtonColor: "#ef4444",
          });
        }
        if (error.response.status === 422) {
          // Error validasi (misal email kosong) tetap menggunakan text merah di bawah form
          setErrors(error.response.data.errors);
        } else if (error.response.status === 401) {
          // 3. Gunakan SweetAlert agar pesan tidak hilang sebelum dibaca
          Swal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text: "Email atau kata sandi yang Anda masukkan salah!",
            confirmButtonColor: "#ef4444",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Terjadi kesalahan pada server.",
            confirmButtonColor: "#ef4444",
          });
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "Koneksi Terputus",
          text: "Tidak dapat terhubung ke server. Periksa internet Anda.",
          confirmButtonColor: "#f59e0b",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 4. Tambahkan PageMeta di sini agar Title berubah saat di halaman Login */}
      <PageMeta
        title="Login | Smart-PROLANIS"
        description="Halaman masuk ke sistem Smart-PROLANIS"
      />

      <div className="flex flex-col flex-1">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Halaman Login
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Masukan email dan kata sandi anda untuk melakukan login!
              </p>
            </div>

            <div>
              <form onSubmit={handleLogin}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="info@gmail.com"
                    />
                    {errors.email && (
                      <span className="text-xs text-error-500 mt-1 block">
                        {errors.email[0]}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label>
                      Kata Sandi <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukan kata sandi"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                    {errors.password && (
                      <span className="text-xs text-error-500 mt-1 block">
                        {errors.password[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to="/"
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Lupa Kata Sandi?
                    </Link>
                  </div>

                  <div>
                    <Button className="w-full" size="sm" disabled={loading}>
                      {loading ? "Memproses..." : "Login"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
