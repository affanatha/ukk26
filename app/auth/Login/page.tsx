"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { loginSchema, type LoginFormValues } from "@/lib/validations/schemas";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setApiError("");

    try {
      const user = await login(values);
      showToast(`Selamat datang kembali, ${user.nama || user.username}!`, "success");

      const role = (user.role || "").toLowerCase();
      if (role === "admin" || role === "admin_space") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Masuk Akun</h1>
        <p className="mt-2 text-sm text-gray-500">
          Silakan masuk dengan akun member atau admin space Anda.
        </p>

        {apiError && (
          <div
            id="login-error-alert"
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Input
              label="Username"
              id="username"
              autoComplete="username"
              placeholder="Masukkan username"
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Kata Sandi"
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Minimal 6 karakter"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            id="btn-login"
            loading={loading}
            className="w-full py-3 mt-4"
          >
            Masuk Sekarang
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Belum memiliki akun?{" "}
          <Link
            href="/auth/Register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
