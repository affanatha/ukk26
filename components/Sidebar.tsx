"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const menu = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/reservation", label: "Reservasi" },
  { href: "/admin/spaces", label: "Ruangan" },
  { href: "/admin/members", label: "Member" },
  { href: "/admin/discount", label: "Diskon" },
  { href: "/admin/reports", label: "Laporan" },
  { href: "/admin/profile", label: "Profil" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full shrink-0 border-b border-gray-200 bg-white md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="p-6">
        <p className="text-lg font-bold text-gray-900">Admin Space</p>
        <p className="mt-1 text-sm text-gray-500">{user?.nama ?? "-"}</p>
      </div>

      <nav className="flex flex-wrap gap-1 px-3 pb-4 md:flex-col">
        {menu.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={() => {
            logout();
            router.push("/auth/Login");
          }}
          className="rounded-lg px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Keluar
        </button>
      </nav>
    </aside>
  );
}
