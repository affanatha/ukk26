"use client";

import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAuth(["admin_space", "admin"]);

  if (!ready) {
    return <main className="p-10 text-gray-500">Memuat sesi…</main>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10">{children}</div>
    </div>
  );
}
