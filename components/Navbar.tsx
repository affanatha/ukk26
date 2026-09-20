"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/Login");
  };

  const isMember = user?.role === "member";
  const isAdmin = user?.role === "admin" || user?.role === "admin_space";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-extrabold text-white text-sm">
            CW
          </span>
          <span className="text-base font-bold text-gray-900 tracking-tight">
            Coworking Space
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <Link
            href="/"
            className={`transition ${
              pathname === "/" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Katalog Space
          </Link>

          {isMember && (
            <>
              <Link
                href="/member"
                className={`transition ${
                  pathname === "/member" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Status Pemesanan
              </Link>
              <Link
                href="/member/history"
                className={`transition ${
                  pathname === "/member/history" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Histori
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              Dashboard Admin →
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900 line-clamp-1">
                  {user.nama || user.username}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
              </div>

              <button
                id="btn-logout"
                onClick={handleLogout}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <Link
                href="/auth/Login"
                id="nav-login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Masuk
              </Link>
              <Link
                href="/auth/Register"
                id="nav-register"
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3 text-sm">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-gray-700"
          >
            Katalog Space
          </Link>
          {isMember && (
            <>
              <Link
                href="/member"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-gray-700"
              >
                Status Pemesanan
              </Link>
              <Link
                href="/member/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-gray-700"
              >
                Histori Pemesanan
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-blue-600 font-bold"
            >
              Dashboard Admin
            </Link>
          )}

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  {user.nama || user.username} ({user.role})
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/Login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold border rounded-lg"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/Register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
