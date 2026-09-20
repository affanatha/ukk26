"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import {
  formatRupiah,
  formatTanggal,
  getAdminReservasi,
  getErrorMessage,
  getIncomeReport,
  type Reservasi,
} from "@/lib/api";

export default function AdminDashboardPage() {
  const now = new Date();

  const [items, setItems] = useState<Reservasi[]>([]);
  const [pendapatan, setPendapatan] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);

    Promise.all([
      getAdminReservasi({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      }),
      getIncomeReport({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      }).catch(() => null),
    ])
      .then(([reservasi, income]) => {
        setItems(reservasi);

        const nilai =
          (income as any)?.total_pendapatan ??
          (income as any)?.total_income ??
          (income as any)?.total ??
          null;

        setPendapatan(nilai === null ? null : Number(nilai));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menunggu = items.filter(
    (item) => (item.status || "").toLowerCase() === "menunggu"
  );

  const kartu = [
    { label: "Reservasi bulan ini", value: String(items.length) },
    { label: "Menunggu persetujuan", value: String(menunggu.length) },
    {
      label: "Pendapatan bulan ini",
      value:
        pendapatan === null
          ? formatRupiah(items.reduce((sum, item) => sum + item.total, 0))
          : formatRupiah(pendapatan),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-900">Ringkasan</h1>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Memuat data…</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {kartu.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Menunggu persetujuan
              </h2>

              <Link
                href="/admin/reservation"
                className="text-sm font-medium text-blue-600"
              >
                Lihat semua
              </Link>
            </div>

            {menunggu.length === 0 ? (
              <p className="mt-4 text-gray-500">
                Tidak ada reservasi yang menunggu.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {menunggu.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.namaSpace}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.namaMember} · {formatTanggal(item.tanggal)}
                      </p>
                    </div>

                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
