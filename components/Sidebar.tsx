"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const menu = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/profile", label: "Profil Lokasi" },
  { href: "/admin/members", label: "Data Member" },
  { href: "/admin/discount", label: "Data Diskon" },
  { href: "/admin/spaces", label: "Data Ruangan" },
  { href: "/admin/reservation", label: "Kelola Reservasi" },
  { href: "/admin/reports", label: "Laporan Pendapatan" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full shrink-0 border-b border-gray-200 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
            CW
          </span>
          <p className="text-sm font-bold text-gray-900">Admin Coworking</p>
        </div>
        <p className="text-xs font-medium text-gray-700 line-clamp-1">
          {user?.nama ?? user?.username ?? "Pengelola"}
        </p>
        <p className="text-[10px] text-gray-400">Panel Pengelola Space</p>
      </div>

      <nav className="flex flex-wrap gap-1 p-3 md:flex-col" id="admin-sidebar-nav">
        {menu.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                active
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-gray-100 md:block hidden">
          <button
            onClick={() => {
              logout();
              router.push("/auth/Login");
            }}
            className="w-full rounded-xl px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            ← Keluar Sesi
          </button>
        </div>
      </nav>
    </aside>
  );
}
