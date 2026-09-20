"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { formatRupiah, getErrorMessage } from "@/lib/api";
import {
  useAdminMonthlyReport,
  useAdminIncomeReport,
  useAdminReservasi,
} from "@/lib/hooks/useAdmin";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function AdminReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: monthlyData, isLoading: loadingMonthly } = useAdminMonthlyReport({
    month,
    year,
  });
  const { data: incomeData, isLoading: loadingIncome } = useAdminIncomeReport({
    month,
    year,
  });
  const { data: reservations = [], isLoading: loadingReservations } = useAdminReservasi({
    month,
    year,
  });

  const isLoading = loadingMonthly || loadingIncome || loadingReservations;

  // Total Reservasi & Total Pendapatan
  const totalReservasi = useMemo(() => {
    if (monthlyData) {
      const val =
        (monthlyData as any).total_reservasi ??
        (monthlyData as any).jumlah_reservasi ??
        (monthlyData as any).total;
      if (val !== undefined && val !== null) return Number(val);
    }
    return reservations.length;
  }, [monthlyData, reservations]);

  const totalPendapatan = useMemo(() => {
    if (incomeData) {
      const val =
        (incomeData as any).total_pendapatan ??
        (incomeData as any).total_income ??
        (incomeData as any).total;
      if (val !== undefined && val !== null) return Number(val);
    }
    return reservations.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [incomeData, reservations]);

  // Data Grafik Garis: Pendapatan Harian
  const dailyChartData = useMemo(() => {
    const rawHarian = (incomeData as any)?.harian ?? (incomeData as any)?.daily;
    if (Array.isArray(rawHarian) && rawHarian.length > 0) {
      return rawHarian.map((d: any) => ({
        day: d.tanggal ? String(d.tanggal).slice(-2) : String(d.hari ?? ""),
        pendapatan: Number(d.total_pendapatan ?? d.pendapatan ?? d.income ?? 0),
      }));
    }

    // Fallback: Agregasi dari list reservasi bulan berjalan
    const daysInMonth = new Date(year, month, 0).getDate();
    const map = new Map<number, number>();
    for (let i = 1; i <= daysInMonth; i++) map.set(i, 0);

    reservations.forEach((r) => {
      if (r.tanggal) {
        const d = new Date(r.tanggal).getDate();
        if (!isNaN(d) && map.has(d)) {
          map.set(d, (map.get(d) || 0) + (r.total || 0));
        }
      }
    });

    return Array.from(map.entries()).map(([d, val]) => ({
      day: `Tgl ${d}`,
      pendapatan: val,
    }));
  }, [incomeData, reservations, year, month]);

  // Data Breakdown Pendapatan per Jenis Space
  const spaceBreakdownData = useMemo(() => {
    const rawBreakdown =
      (incomeData as any)?.breakdown_tipe ??
      (monthlyData as any)?.reservasi_per_space ??
      (incomeData as any)?.by_space;

    if (Array.isArray(rawBreakdown) && rawBreakdown.length > 0) {
      return rawBreakdown.map((item: any) => ({
        tipe: item.tipe_space ?? item.nama_space ?? item.tipe ?? "Lainnya",
        total: Number(item.total_pendapatan ?? item.total ?? item.income ?? 0),
        jumlah: Number(item.jumlah_reservasi ?? item.count ?? 0),
      }));
    }

    // Fallback: agregasi dari reservations
    const typeMap = new Map<string, { total: number; count: number }>();
    reservations.forEach((r) => {
      const type = (r.raw as any)?.tipe_space || (r.raw as any)?.tipe || "General";
      const existing = typeMap.get(type) || { total: 0, count: 0 };
      typeMap.set(type, {
        total: existing.total + (r.total || 0),
        count: existing.count + 1,
      });
    });

    return Array.from(typeMap.entries()).map(([tipe, val]) => ({
      tipe,
      total: val.total,
      jumlah: val.count,
    }));
  }, [incomeData, monthlyData, reservations]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rekapitulasi Pendapatan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Laporan finansial bulanan, grafik tren pendapatan harian, dan analisis jenis space.
          </p>
        </div>

        {/* Filter Bulan & Tahun */}
        <div className="flex items-center gap-2">
          <select
            id="report-select-month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-blue-500 shadow-xs"
          >
            {BULAN.map((b, idx) => (
              <option key={b} value={idx + 1}>
                {b}
              </option>
            ))}
          </select>

          <select
            id="report-select-year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-blue-500 shadow-xs"
          >
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kartu Ringkasan Metrik Utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 mb-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500">Total Pemesanan Masuk</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900" id="stat-report-reservasi">
            {totalReservasi}{" "}
            <span className="text-sm font-normal text-gray-500">Transaksi</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Periode {BULAN[month - 1]} {year}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:col-span-2 md:col-span-2">
          <p className="text-xs font-medium text-gray-500">Total Pendapatan Bersih</p>
          <p className="mt-2 text-3xl font-extrabold text-blue-600" id="stat-report-pendapatan">
            {formatRupiah(totalPendapatan)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Total akumulasi penerimaan coworking space pada periode terpilih
          </p>
        </div>
      </div>

      {/* Chart Garis Pendapatan Harian (Recharts) */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 mb-8" id="chart-container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Grafik Tren Pendapatan Harian
            </h2>
            <p className="text-xs text-gray-500">
              Pergerakan pendapatan per hari sepanjang bulan {BULAN[month - 1]} {year}
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any) => [formatRupiah(Number(value)), "Pendapatan"]}
                labelFormatter={(label) => `Hari: ${label}`}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="pendapatan"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 3, fill: "#2563eb" }}
                activeDot={{ r: 6, fill: "#1d4ed8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Pendapatan per Jenis Space */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-900 mb-1">
          Breakdown Pendapatan per Jenis Ruangan
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Kontribusi masing-masing kategori space terhadap total pemasukan.
        </p>

        {spaceBreakdownData.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">
            Belum ada data kontribusi jenis space pada periode ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spaceBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="tipe" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), "Total"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {spaceBreakdownData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-xs">{item.tipe}</p>
                    <p className="text-xs text-gray-400">{item.jumlah} reservasi</p>
                  </div>
                  <p className="font-extrabold text-blue-600 text-sm">
                    {formatRupiah(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
