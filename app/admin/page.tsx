"use client";

import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatRupiah, formatTanggal } from "@/lib/api";
import { useAdminReservasi, useAdminIncomeReport } from "@/lib/hooks/useAdmin";

export default function AdminDashboardPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: items = [], isLoading: loadingReservasi } = useAdminReservasi({
    month,
    year,
  });

  const { data: incomeData, isLoading: loadingIncome } = useAdminIncomeReport({
    month,
    year,
  });

  const isLoading = loadingReservasi || loadingIncome;

  const menunggu = items.filter((item) => {
    const st = (item.status || "").toLowerCase().trim();
    return st === "menunggu" || st === "belum dikonfirmasi";
  });

  const totalPendapatan =
    (incomeData as any)?.total_pendapatan ??
    (incomeData as any)?.total_income ??
    items.reduce((sum, item) => sum + (item.total || 0), 0);

  const kartu = [
    { label: "Reservasi Bulan Ini", value: String(items.length), unit: "Pemesanan" },
    { label: "Menunggu Persetujuan", value: String(menunggu.length), unit: "Perlu Tindakan" },
    { label: "Total Pendapatan", value: formatRupiah(totalPendapatan), unit: "Bulan Berjalan" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Ringkasan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ringkasan operasional dan aktivitas coworking space Anda.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 animate-pulse h-28"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {kartu.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-gray-900">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-gray-400">{item.unit}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Perlu Ditindaklanjuti
                </h2>
                <p className="text-xs text-gray-500">
                  Reservasi baru yang menunggu konfirmasi admin
                </p>
              </div>

              <Link
                href="/admin/reservation"
                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                Lihat Semua ({menunggu.length})
              </Link>
            </div>

            {menunggu.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                🎉 Semua reservasi sudah ditindaklanjuti! Tidak ada pesanan menunggu.
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {menunggu.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 px-2 rounded-xl transition"
                  >
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {item.namaSpace}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pemesan: <span className="font-medium text-gray-700">{item.namaMember}</span> ·{" "}
                        {formatTanggal(item.tanggal)} ({item.jamMulai})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-600 text-xs">
                        {formatRupiah(item.total)}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
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
