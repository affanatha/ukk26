"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToast } from "@/lib/toast-context";
import {
  getErrorMessage,
  registerAdminSpace,
  registerMember,
  uploadMemberImage,
} from "@/lib/api";
import {
  registerMemberSchema,
  registerAdminSchema,
  type RegisterMemberFormValues,
  type RegisterAdminFormValues,
} from "@/lib/validations/schemas";

type Mode = "member" | "admin";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("member");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const memberForm = useForm<RegisterMemberFormValues>({
    resolver: zodResolver(registerMemberSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      nama_member: "",
      instansi: "",
      alamat: "",
      telp: "",
    },
  });

  const adminForm = useForm<RegisterAdminFormValues>({
    resolver: zodResolver(registerAdminSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      nama_coworking: "",
      nama_pemilik: "",
      telp: "",
    },
  });

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFoto(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setFotoPreview(url);
    } else {
      setFotoPreview(null);
    }
  };

  const onMemberSubmit = async (values: RegisterMemberFormValues) => {
    setLoading(true);
    setApiError("");

    try {
      let namaFile: string | undefined;

      if (foto) {
        try {
          namaFile = await uploadMemberImage(foto);
        } catch {
          // Upload foto gagal tidak membatalkan registrasi akun
        }
      }

      await registerMember({
        username: values.username,
        password: values.password,
        nama_member: values.nama_member,
        instansi: values.instansi || "",
        alamat: values.alamat,
        telp: values.telp,
        foto: namaFile,
      });

      showToast("Pendaftaran berhasil! Silakan masuk.", "success");
      router.push("/auth/Login");
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onAdminSubmit = async (values: RegisterAdminFormValues) => {
    setLoading(true);
    setApiError("");

    try {
      await registerAdminSpace({
        username: values.username,
        password: values.password,
        nama_coworking: values.nama_coworking,
        nama_pemilik: values.nama_pemilik,
        telp: values.telp,
      });

      showToast("Pendaftaran admin berhasil! Silakan masuk.", "success");
      router.push("/auth/Login");
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
        <p className="mt-1 text-sm text-gray-500">
          Daftar sebagai member atau pengelola coworking space.
        </p>

        <div className="mt-5 flex gap-2 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            id="tab-member"
            onClick={() => {
              setMode("member");
              setApiError("");
            }}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "member"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Member
          </button>
          <button
            type="button"
            id="tab-admin"
            onClick={() => {
              setMode("admin");
              setApiError("");
            }}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "admin"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Admin Space
          </button>
        </div>

        {apiError && (
          <div
            id="register-error-alert"
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {apiError}
          </div>
        )}

        {mode === "member" ? (
          <form
            id="form-register-member"
            onSubmit={memberForm.handleSubmit(onMemberSubmit)}
            className="mt-6 space-y-4"
          >
            <div>
              <Input
                label="Nama Lengkap"
                id="nama_member"
                placeholder="Masukkan nama lengkap"
                {...memberForm.register("nama_member")}
              />
              {memberForm.formState.errors.nama_member && (
                <p className="mt-1 text-xs text-red-600">
                  {memberForm.formState.errors.nama_member.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Instansi (Opsional)"
                id="instansi"
                placeholder="Perusahaan / Kampus / Sekolah"
                {...memberForm.register("instansi")}
              />
            </div>

            <div>
              <Input
                label="Nomor Telepon"
                id="telp"
                type="tel"
                placeholder="081234567890"
                {...memberForm.register("telp")}
              />
              {memberForm.formState.errors.telp && (
                <p className="mt-1 text-xs text-red-600">
                  {memberForm.formState.errors.telp.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Alamat"
                id="alamat"
                placeholder="Alamat tempat tinggal"
                {...memberForm.register("alamat")}
              />
              {memberForm.formState.errors.alamat && (
                <p className="mt-1 text-xs text-red-600">
                  {memberForm.formState.errors.alamat.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Username"
                id="username"
                autoComplete="username"
                placeholder="username unik"
                {...memberForm.register("username")}
              />
              {memberForm.formState.errors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {memberForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  label="Kata Sandi"
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 karakter"
                  {...memberForm.register("password")}
                />
                {memberForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {memberForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Konfirmasi Sandi"
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Ulangi kata sandi"
                  {...memberForm.register("confirmPassword")}
                />
                {memberForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {memberForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto Profil (Opsional)
              </label>
              <div className="flex items-center gap-4">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Preview foto"
                    className="h-12 w-12 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-medium border border-gray-200">
                    Foto
                  </div>
                )}
                <input
                  type="file"
                  id="foto-profile"
                  aria-label="Foto Profil"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="flex-1 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <Button
              type="submit"
              id="btn-register-member"
              loading={loading}
              className="w-full py-3 mt-4"
            >
              Daftar Sebagai Member
            </Button>
          </form>
        ) : (
          <form
            id="form-register-admin"
            onSubmit={adminForm.handleSubmit(onAdminSubmit)}
            className="mt-6 space-y-4"
          >
            <div>
              <Input
                label="Nama Coworking Space"
                id="nama_coworking"
                placeholder="Contoh: Indigo Hub Malang"
                {...adminForm.register("nama_coworking")}
              />
              {adminForm.formState.errors.nama_coworking && (
                <p className="mt-1 text-xs text-red-600">
                  {adminForm.formState.errors.nama_coworking.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Nama Pemilik / Pengelola"
                id="nama_pemilik"
                placeholder="Nama lengkap pengelola"
                {...adminForm.register("nama_pemilik")}
              />
              {adminForm.formState.errors.nama_pemilik && (
                <p className="mt-1 text-xs text-red-600">
                  {adminForm.formState.errors.nama_pemilik.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Nomor Telepon"
                id="telp-admin"
                type="tel"
                placeholder="081234567890"
                {...adminForm.register("telp")}
              />
              {adminForm.formState.errors.telp && (
                <p className="mt-1 text-xs text-red-600">
                  {adminForm.formState.errors.telp.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Username"
                id="username-admin"
                autoComplete="username"
                placeholder="username unik admin"
                {...adminForm.register("username")}
              />
              {adminForm.formState.errors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {adminForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  label="Kata Sandi"
                  id="password-admin"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 karakter"
                  {...adminForm.register("password")}
                />
                {adminForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {adminForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Konfirmasi Sandi"
                  id="confirmPassword-admin"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Ulangi kata sandi"
                  {...adminForm.register("confirmPassword")}
                />
                {adminForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {adminForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              id="btn-register-admin"
              loading={loading}
              className="w-full py-3 mt-4"
            >
              Daftar Sebagai Pengelola
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/auth/Login" className="font-semibold text-blue-600 hover:text-blue-700">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
