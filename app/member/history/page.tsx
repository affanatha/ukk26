"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ReservationCard from "@/components/Reservation";
import { getErrorMessage, getMyHistory, type Reservasi } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-context";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function MemberHistoryPage() {
  const { ready } = useRequireAuth(["member"]);
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [items, setItems] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    setLoading(true);
    setError("");

    getMyHistory({ month, year })
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [ready, month, year]);

  if (!ready) {
    return <main className="p-10 text-gray-500">Memuat sesi…</main>;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat reservasi</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900"
            >
              {BULAN.map((nama, index) => (
                <option key={nama} value={index + 1}>
                  {nama}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900"
            >
              {Array.from({ length: 5 }, (_, index) => now.getFullYear() - 2 + index).map(
                (tahun) => (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                )
              )}
            </select>
          </div>

          {loading && <p className="mt-8 text-gray-500">Memuat riwayat…</p>}

          {error && (
            <p className="mt-8 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="mt-8 text-gray-500">
              Tidak ada reservasi pada periode ini.
            </p>
          )}

          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <ReservationCard key={item.id} reservasi={item} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
