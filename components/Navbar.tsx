"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/Login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-gray-900">
          Coworking Space
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <Link href="/member/spaces" className="text-gray-600 hover:text-gray-900">
            Ruangan
          </Link>

          {user ? (
            <>
              <Link
                href={user.role === "member" ? "/member" : "/admin"}
                className="text-gray-600 hover:text-gray-900"
              >
                {user.role === "member" ? "Reservasi saya" : "Dashboard"}
              </Link>

              <span className="hidden text-gray-400 sm:inline">
                {user.nama || user.username}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/Login" className="text-gray-600 hover:text-gray-900">
                Masuk
              </Link>

              <Link
                href="/auth/Register"
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
