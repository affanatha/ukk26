"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToast } from "@/lib/toast-context";
import { getErrorMessage } from "@/lib/api";
import { useAdminProfile, useUpdateAdminProfileMutation } from "@/lib/hooks/useAdmin";

export default function AdminProfilePage() {
  const { showToast } = useToast();
  const { data, isLoading, error: queryError } = useAdminProfile();
  const updateMutation = useUpdateAdminProfileMutation();

  const [form, setForm] = useState({
    nama_coworking: "",
    nama_pemilik: "",
    telp: "",
    alamat: "",
    deskripsi_fasilitas: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (data) {
      const source = (data as any)?.admin ?? (data as any)?.user ?? data ?? {};
      setForm({
        nama_coworking: source.nama_coworking ?? "",
        nama_pemilik: source.nama_pemilik ?? "",
        telp: source.telp ?? "",
        alamat: source.alamat ?? "",
        deskripsi_fasilitas: source.deskripsi_fasilitas ?? source.fasilitas ?? "",
      });
    }
  }, [data]);

  const update = (key: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      await updateMutation.mutateAsync(form);
      showToast("Profil coworking space berhasil diperbarui.", "success");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-gray-500 font-medium">Memuat profil pengelola…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profil Coworking Space</h1>
        <p className="mt-1 text-sm text-gray-500">
          Informasi profil lokasi coworking space dan kontak pemilik.
        </p>
      </div>

      {(error || queryError) && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error || getErrorMessage(queryError)}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-gray-100"
      >
        <div>
          <Input
            label="Nama Coworking Space"
            id="nama_coworking"
            value={form.nama_coworking}
            required
            onChange={update("nama_coworking")}
          />
        </div>

        <div>
          <Input
            label="Nama Pemilik / Pengelola"
            id="nama_pemilik"
            value={form.nama_pemilik}
            required
            onChange={update("nama_pemilik")}
          />
        </div>

        <div>
          <Input
            label="Nomor Telepon Kontak"
            id="telp"
            type="tel"
            value={form.telp}
            required
            onChange={update("telp")}
          />
        </div>

        <div>
          <Input
            label="Alamat Lengkap Lokasi"
            id="alamat"
            value={form.alamat}
            placeholder="Jalan, Kota, Kode Pos"
            onChange={update("alamat")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Deskripsi Fasilitas
          </label>
          <textarea
            id="deskripsi_fasilitas"
            rows={4}
            value={form.deskripsi_fasilitas}
            onChange={update("deskripsi_fasilitas")}
            placeholder="Contoh: High-speed WiFi 100Mbps, Free Flow Coffee, Mushola, Meeting Room Smart TV..."
            className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <Button
            type="submit"
            id="btn-save-profile"
            loading={updateMutation.isPending}
            className="px-6 py-2.5 font-semibold"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
