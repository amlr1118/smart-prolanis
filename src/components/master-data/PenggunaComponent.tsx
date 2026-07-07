import React, { useState, useEffect } from "react";
//import axios from "axios";
import Swal from "sweetalert2";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import api from "../../services/api";

interface Inputan {
  id: number;
  userid: string;
  name: string;
  role: string;
  email: string;
  password: string;
}

// Tambahkan interface untuk metadata pagination Laravel
interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function PenggunaComponent() {
  const { isOpen, openModal, closeModal } = useModal();

  const [peserta, setPeserta] = useState<Inputan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const options = [
    { value: "1", label: "Dokter" },
    { value: "2", label: "Perawat" },
    { value: "3", label: "Gizi" },
  ];

  // --- STATE BARU UNTUK FORM & VALIDASI ---
  const [formData, setFormData] = useState({
    userid: "",
    name: "",
    role: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));

    // (Opsional) Jika ada error diagnosa sebelumnya, hilangkan saat user memilih
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: [] }));
    }
  };

  // Ubah function untuk menerima parameter page
  const getData = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      // Kirim parameter page dan search ke backend
      const response = await api.get(`/pengguna?page=${page}&search=${search}`);

      setPeserta(response.data.data);
      setMeta({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Panggil ulang API setiap kali currentPage berubah
  useEffect(() => {
    getData(currentPage, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    // Memberi jeda 500ms sebelum memanggil API saat user mengetik
    const delayDebounceFn = setTimeout(() => {
      // Kembalikan ke halaman 1 setiap kali melakukan pencarian baru
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        // Jika sudah di halaman 1, langsung panggil API
        getData(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]); // Effect ini berjalan setiap kali searchTerm berubah

  // Handler untuk mengubah halaman
  const handleNextPage = () => {
    if (meta && currentPage < meta.last_page) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // --- FUNGSI HANDLE INPUT FORM ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    //console.log(`Mengetik di input: ${name}, Nilai: ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hapus pesan error saat user mulai mengetik ulang
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleAdd = () => {
    setEditId(null); // Set mode tambah
    setFormData({ userid: "", name: "", role: "", email: "", password: "" }); // Kosongkan form
    setErrors({});
    openModal();
  };

  // --- HANDLER TOMBOL EDIT DATA ---
  const handleEdit = (item: Inputan) => {
    setEditId(item.id); // Set mode edit dengan ID peserta
    setFormData({
      userid: item.userid,
      name: item.name,
      role: item.role,
      email: item.email,
      password: item.password,
    }); // Isi form dengan data yang dipilih
    setErrors({});
    openModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      let response;

      // Jika editId ada, lakukan PUT request untuk update
      if (editId) {
        response = await api.put(`/update-pengguna/${editId}`, formData);
      } else {
        // Jika tidak ada, lakukan POST request untuk tambah baru
        response = await api.post("/register", formData);
      }

      setSuccessMessage(response.data.message);
      closeModal();
      setFormData({
        userid: "",
        name: "",
        role: "",
        email: "",
        password: "",
      });
      setEditId(null); // Reset mode

      // Refresh tabel (jika edit tetap di halaman saat ini, jika tambah biasanya kembali ke halaman 1)
      getData(editId ? currentPage : 1, searchTerm);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Terjadi kesalahan:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setEditId(null);
    setFormData({ userid: "", name: "", role: "", email: "", password: "" });
    setErrors({});
    closeModal();
  };

  // --- HANDLER TOMBOL HAPUS DATA ---
  // --- HANDLER TOMBOL HAPUS DATA (DENGAN SWEETALERT2) ---
  const handleDelete = async (id: number) => {
    // 1. Tampilkan dialog konfirmasi SweetAlert
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data peserta ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Warna merah untuk tombol hapus
      cancelButtonColor: "#3085d6", // Warna biru untuk tombol batal
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    // 2. Jika user menekan tombol "Ya, Hapus!"
    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/hapus-pengguna/${id}`);

        // Tampilkan pop-up sukses
        Swal.fire({
          title: "Terhapus!",
          text: response.data.message || "Data peserta berhasil dihapus.",
          icon: "success",
          timer: 2000, // Otomatis tertutup setelah 2 detik
          showConfirmButton: false,
        });

        // Refresh tabel
        getData(currentPage, searchTerm);
      } catch (error) {
        console.error("Terjadi kesalahan saat menghapus data:", error);

        // Tampilkan pop-up error jika gagal
        Swal.fire(
          "Gagal!",
          "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
          "error",
        );
      }
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {/* --- NOTIFIKASI SUKSES --- */}
        {successMessage && (
          <div className="mb-4 flex items-center rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
            <svg
              className="me-3 h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search (Fitur search nantinya juga harus mengirim param pencarian ke server) */}
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Cari peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {/* SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
              />
            </svg>
          </div>

          {/* Button */}
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v14m7-7H5"
              />
            </svg>
            Tambah Pengguna
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">No Identitas</th>
                  <th className="px-6 py-3 font-semibold">Nama</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : peserta.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      Data tidak ada
                    </td>
                  </tr>
                ) : (
                  peserta.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{item.userid}</td>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="px-6 py-4">
                        {item.role === "1"
                          ? "Dokter"
                          : item.role === "2"
                            ? "Perawat"
                            : item.role === "3"
                              ? "Gizi"
                              : "Tidak diketahui"}
                      </td>
                      <td className="px-6 py-4">{item.email}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="mr-2 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Kontrol Pagination (Ditambahkan di bawah tabel) */}
          {!loading && meta && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Menampilkan{" "}
                  <span className="font-medium">
                    {(meta.current_page - 1) * meta.per_page + 1}
                  </span>{" "}
                  hingga{" "}
                  <span className="font-medium">
                    {Math.min(meta.current_page * meta.per_page, meta.total)}
                  </span>{" "}
                  dari <span className="font-medium">{meta.total}</span> data
                </p>
              </div>
              <div className="flex flex-1 justify-between sm:justify-end gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={meta.current_page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={meta.current_page === meta.last_page}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="mb-6">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {editId ? "Form Edit Data Pengguna" : "Form Tambah Pengguna"}
            </h4>
          </div>

          <form onSubmit={handleSave} className="flex flex-col">
            <div className="flex flex-col gap-5">
              <div>
                <Label>Nomor Identitas</Label>
                <Input
                  name="userid"
                  type="number"
                  value={formData.userid}
                  onChange={handleInputChange}
                  className={`mt-2 ${errors.userid ? "border-red-500" : ""}`}
                  placeholder="Nomor Identitas"
                />
                {errors.userid && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.userid[0]}
                  </span>
                )}
              </div>

              <div>
                <Label>Nama Pengguna</Label>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-2 ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Nama Pengguna"
                />
                {errors.name && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.name[0]}
                  </span>
                )}
              </div>

              <div>
                <Label>Role</Label>
                <Select
                  options={options}
                  placeholder="Pilih Role"
                  value={formData.role}
                  onChange={handleSelectChange}
                  className={`dark:bg-dark-900 ${errors.role ? "border-red-500" : ""}`}
                />
                {errors.role && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.role[0]}
                  </span>
                )}
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-2 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="Email Pengguna"
                />
                {errors.email && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.email[0]}
                  </span>
                )}
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-2 ${errors.password ? "border-red-500" : ""}`}
                  placeholder=""
                />
                {errors.password && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.password[0]}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button size="sm" variant="outline" onClick={handleCloseModal}>
                Batal
              </Button>

              <Button size="sm" disabled={isSaving}>
                {isSaving
                  ? "Menyimpan..."
                  : editId
                    ? "Update Data"
                    : "Simpan Data"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
