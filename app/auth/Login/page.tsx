"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login({ username, password });
      router.push(user.role === "member" ? "/member" : "/admin");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Masuk</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gunakan akun member atau admin space kamu.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <Input
            label="Username"
            value={username}
            required
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />

          <Input
            label="Kata sandi"
            type="password"
            value={password}
            required
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full py-3">
            Masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link href="/auth/Register" className="font-medium text-blue-600">
            Daftar sebagai member
          </Link>
        </p>
      </div>
    </main>
  );
}
