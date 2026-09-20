"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ReservationCard from "@/components/Reservation";
import {
  cancelReservasi,
  getErrorMessage,
  getMyReservasi,
  type Reservasi,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-context";

export default function MemberDashboardPage() {
  const { user, ready } = useRequireAuth(["member"]);

  const [items, setItems] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    getMyReservasi()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Batalkan reservasi ini?")) return;

    try {
      await cancelReservasi(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!ready) {
    return <main className="p-10 text-gray-500">Memuat sesi…</main>;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Halo, {user?.nama || user?.username}
              </h1>
              <p className="mt-2 text-gray-600">Reservasi aktif kamu.</p>
            </div>

            <Link
              href="/member/history"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Riwayat
            </Link>
          </div>

          {loading && <p className="mt-8 text-gray-500">Memuat reservasi…</p>}

          {error && (
            <p className="mt-8 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">Belum ada reservasi.</p>

              <Link
                href="/member/spaces"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Cari ruangan
              </Link>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <ReservationCard
                key={item.id}
                reservasi={item}
                onCancel={handleCancel}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
