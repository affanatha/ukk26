"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import ReservationDetailModal from "@/components/admin/ReservationDetailModal";
import { formatRupiah, formatTanggal, getErrorMessage, type Reservasi } from "@/lib/api";
import { useAdminReservasi, useAdminSpaces } from "@/lib/hooks/useAdmin";

const STATUS_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Menunggu Persetujuan", value: "menunggu" },
  { label: "Disetujui", value: "disetujui" },
  { label: "Aktif", value: "aktif" },
  { label: "Selesai", value: "selesai" },
  { label: "Ditolak", value: "ditolak" },
  { label: "Dibatalkan", value: "dibatalkan" },
];

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function AdminReservationPage() {
  const now = new Date();

  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [status, setStatus] = useState<string>("");
  const [spaceId, setSpaceId] = useState<string>("");
  const [tanggal, setTanggal] = useState<string>("");

  const [selectedReservasi, setSelectedReservasi] = useState<Reservasi | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data: spaces = [] } = useAdminSpaces();
  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useAdminReservasi({
    month,
    year,
    status: status || undefined,
    id_space: spaceId || undefined,
    tanggal: tanggal || undefined,
  });

  const handleOpenDetail = (item: Reservasi) => {
    setSelectedReservasi(item);
    setDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setStatus("");
    setSpaceId("");
    setTanggal("");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Semua Reservasi</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pantau seluruh pesanan masuk, filter periode, dan kelola status check-in/out.
        </p>
      </div>

      {/* Baris Filter: Bulan, Tahun, Status, Space, Tanggal */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Bulan
            </label>
            <select
              id="filter-bulan"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
            >
              {BULAN.map((b, idx) => (
                <option key={b} value={idx + 1}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Tahun
            </label>
            <select
              id="filter-tahun"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Ruangan
            </label>
            <select
              id="filter-space"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="">Semua Ruangan</option>
              {spaces.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Tanggal Spesifik
            </label>
            <input
              type="date"
              id="filter-tanggal"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {(status || spaceId || tanggal) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Filter Tambahan
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {getErrorMessage(error)}
        </div>
      )}

      {/* Tabel Semua Reservasi */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100">
        <table className="w-full min-w-[750px] text-left text-sm" id="table-admin-reservations">
          <thead className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-5 py-3.5">Kode & Space</th>
              <th className="px-5 py-3.5">Member</th>
              <th className="px-5 py-3.5">Jadwal Reservasi</th>
              <th className="px-5 py-3.5">Total Bayar</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                  Tidak ada reservasi yang sesuai dengan kriteria filter.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="hover:bg-blue-50/40 cursor-pointer transition"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900">{item.namaSpace}</p>
                    <p className="font-mono text-xs text-gray-400">
                      {item.kode || `#${item.id}`}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">
                    {item.namaMember}
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-xs">
                    <p className="font-medium text-gray-900">{formatTanggal(item.tanggal)}</p>
                    <p className="text-gray-500">
                      {item.jamMulai} · {item.durasiJam} Jam
                    </p>
                  </td>
                  <td className="px-5 py-4 font-bold text-blue-600">
                    {formatRupiah(item.total)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-block rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition">
                      Kelola →
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Layar B.7: Modal Kelola Reservasi Detail per Transaksi */}
      <ReservationDetailModal
        open={detailModalOpen}
        reservasi={selectedReservasi}
        onClose={() => setDetailModalOpen(false)}
        onUpdated={refetch}
      />
    </div>
  );
}
