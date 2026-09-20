"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  getErrorMessage,
  registerAdminSpace,
  registerMember,
  uploadMemberImage,
} from "@/lib/api";

type Mode = "member" | "admin";

export default function RegisterPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("member");
  const [form, setForm] = useState({
    username: "",
    password: "",
    nama_member: "",
    instansi: "",
    alamat: "",
    telp: "",
    nama_coworking: "",
    nama_pemilik: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "member") {
        let namaFile: string | undefined;

        if (foto) {
          try {
            namaFile = await uploadMemberImage(foto);
          } catch {
            // Upload gagal tidak perlu membatalkan pendaftaran.
          }
        }

        await registerMember({
          username: form.username,
          password: form.password,
          nama_member: form.nama_member,
          instansi: form.instansi,
          alamat: form.alamat,
          telp: form.telp,
          foto: namaFile,
        });
      } else {
        await registerAdminSpace({
          username: form.username,
          password: form.password,
          nama_coworking: form.nama_coworking,
          nama_pemilik: form.nama_pemilik,
          telp: form.telp,
        });
      }

      router.push("/auth/Login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Buat akun</h1>

        <div className="mt-5 flex gap-2 rounded-lg bg-gray-100 p-1">
          {(["member", "admin"] as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === item
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {item === "member" ? "Member" : "Admin space"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Username" value={form.username} required onChange={update("username")} />

          <Input
            label="Kata sandi"
            type="password"
            value={form.password}
            required
            onChange={update("password")}
          />

          {mode === "member" ? (
            <>
              <Input
                label="Nama lengkap"
                value={form.nama_member}
                required
                onChange={update("nama_member")}
              />

              <Input
                label="Instansi"
                value={form.instansi}
                required
                onChange={update("instansi")}
              />

              <Input label="Alamat" value={form.alamat} required onChange={update("alamat")} />

              <Input label="Nomor telepon" value={form.telp} required onChange={update("telp")} />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Foto profil
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFoto(event.target.files?.[0] ?? null)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700"
                />
              </label>
            </>
          ) : (
            <>
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
            </>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full py-3">
            Daftar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/auth/Login" className="font-medium text-blue-600">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
