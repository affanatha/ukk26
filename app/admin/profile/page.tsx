"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  getAdminProfile,
  getErrorMessage,
  updateAdminProfile,
} from "@/lib/api";

export default function AdminProfilePage() {
  const [form, setForm] = useState({
    nama_coworking: "",
    nama_pemilik: "",
    telp: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    getAdminProfile()
      .then((data: any) => {
        const source = data?.admin ?? data?.user ?? data ?? {};
        setForm({
          nama_coworking: source.nama_coworking ?? "",
          nama_pemilik: source.nama_pemilik ?? "",
          telp: source.telp ?? "",
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const simpan = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setPesan("");

    try {
      await updateAdminProfile(form);
      setPesan("Profil tersimpan.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Memuat profil…</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-bold text-gray-900">Profil coworking</h1>

      <form onSubmit={simpan} className="mt-6 space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <Input
          label="Nama coworking"
          value={form.nama_coworking}
          required
          onChange={update("nama_coworking")}
        />

        <Input
          label="Nama pemilik"
          value={form.nama_pemilik}
          required
          onChange={update("nama_pemilik")}
        />

        <Input label="Nomor telepon" value={form.telp} required onChange={update("telp")} />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {pesan && (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {pesan}
          </p>
        )}

        <Button type="submit" loading={saving}>
          Simpan perubahan
        </Button>
      </form>
    </div>
  );
}
