"use client";

import { useEffect, useState } from "react";
import {
  formatRupiah,
  getErrorMessage,
  getIncomeReport,
  getMonthlyReport,
} from "@/lib/api";

type Ringkasan = { label: string; value: string };

function bacaAngka(source: any, keys: string[]): number | null {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

export default function AdminReportsPage() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [ringkasan, setRingkasan] = useState<Ringkasan[]>([]);
  const [mentah, setMentah] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([
      getMonthlyReport({ month, year }),
      getIncomeReport({ month, year }),
    ])
      .then(([monthly, income]: any[]) => {
        const sumber = { ...(monthly ?? {}), ...(income ?? {}) };
        setMentah({ monthly, income });

        const total = bacaAngka(sumber, [
          "total_reservasi",
          "jumlah_reservasi",
          "total",
        ]);
        const selesai = bacaAngka(sumber, ["total_selesai", "selesai"]);
        const pendapatan = bacaAngka(sumber, [
          "total_pendapatan",
          "total_income",
          "pendapatan",
        ]);

        const hasil: Ringkasan[] = [];
        if (total !== null) hasil.push({ label: "Total reservasi", value: String(total) });
        if (selesai !== null) hasil.push({ label: "Reservasi selesai", value: String(selesai) });
        if (pendapatan !== null)
          hasil.push({ label: "Total pendapatan", value: formatRupiah(pendapatan) });

        setRingkasan(hasil);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [month, year]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={month}
          onChange={(event) => setMonth(Number(event.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900"
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((bulan) => (
            <option key={bulan} value={bulan}>
              Bulan {bulan}
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

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Memuat laporan…</p>
      ) : (
        <>
          {ringkasan.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {ringkasan.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Data mentah</h2>

            <p className="mt-1 text-sm text-gray-500">
              Tampilan sementara sampai struktur laporan dari server dipetakan ke tabel.
            </p>

            <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-gray-50 p-4 text-xs text-gray-700">
              {JSON.stringify(mentah, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
