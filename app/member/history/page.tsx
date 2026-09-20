"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ReservationCard from "@/components/Reservation";
import { formatRupiah, getErrorMessage } from "@/lib/api";
import { useMyHistory } from "@/lib/hooks/useReservasi";
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

  const { data: items = [], isLoading, error } = useMyHistory({ month, year }, ready);

  // Metrik ringkasan
  const totalReservasi = items.length;
  const totalPengeluaran = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [items]);

  if (!ready) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center p-6 text-gray-500">
          Memuat sesi login...
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/member"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mb-1"
              >
                ← Kembali ke Status Pemesanan
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Histori Pemesanan</h1>
              <p className="mt-1 text-sm text-gray-500">
                Lacak seluruh transaksi dan pemakaian ruangan Anda per periode bulan.
              </p>
            </div>

            {/* Filter Bulan & Tahun */}
            <div className="flex items-center gap-3">
              <select
                id="select-month"
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 shadow-xs"
              >
                {BULAN.map((nama, index) => (
                  <option key={nama} value={index + 1}>
                    {nama}
                  </option>
                ))}
              </select>

              <select
                id="select-year"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 shadow-xs"
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
          </div>

          {/* Ringkasan Total Reservasi & Total Pengeluaran */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500">Total Pemesanan Bulan Ini</p>
              <p className="mt-2 text-2xl font-bold text-gray-900" id="stat-total-reservasi">
                {totalReservasi} <span className="text-sm font-normal text-gray-500">Reservasi</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500">Total Pengeluaran Bulan Ini</p>
              <p className="mt-2 text-2xl font-bold text-blue-600" id="stat-total-pengeluaran">
                {formatRupiah(totalPengeluaran)}
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {getErrorMessage(error)}
            </div>
          )}

          {isLoading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 animate-pulse h-28"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
              <p className="text-base font-semibold text-gray-800">
                Tidak ada histori pemesanan
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Tidak ditemukan riwayat reservasi pada {BULAN[month - 1]} {year}.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <ReservationCard key={item.id} reservasi={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
