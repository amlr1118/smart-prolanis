// services/api.ts (atau nama file konfigurasi axios Anda)

import axios from "axios";

// Buat instance axios
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Sesuaikan dengan URL Laravel Anda
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Tambahkan Interceptor untuk menyisipkan Token otomatis
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem("token");

    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;