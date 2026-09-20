"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import {
  checkIn,
  checkOut,
  formatRupiah,
  formatTanggal,
  getAdminReservasi,
  getErrorMessage,
  updateStatusReservasi,
  type Reservasi,
} from "@/lib/api";

const STATUS = ["", "menunggu", "disetujui", "ditolak", "dibatalkan", "selesai"];

export default function AdminReservationPage() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    getAdminReservasi({ month, year, status: status || undefined })
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [month, year, status]);

  useEffect(load, [load]);

  const jalankan = async (id: number, aksi: () => Promise<unknown>) => {
    setBusyId(id);
    setError("");

    try {
      await aksi();
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900">Reservasi</h1>

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

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900"
        >
          {STATUS.map((item) => (
            <option key={item || "semua"} value={item}>
              {item || "Semua status"}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Memuat reservasi…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-gray-500">
          Tidak ada reservasi pada filter ini.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const statusKini = (item.status || "").toLowerCase();
            const busy = busyId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {item.namaSpace}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.namaMember} · {formatTanggal(item.tanggal)} ·{" "}
                      {item.jamMulai} · {item.durasiJam} jam
                    </p>

                    <p className="mt-1 text-sm font-semibold text-blue-600">
                      {formatRupiah(item.total)}
                    </p>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {statusKini === "menunggu" && (
                    <>
                      <Button
                        loading={busy}
                        onClick={() =>
                          jalankan(item.id, () =>
                            updateStatusReservasi(item.id, "disetujui")
                          )
                        }
                      >
                        Setujui
                      </Button>

                      <Button
                        variant="danger"
                        loading={busy}
                        onClick={() =>
                          jalankan(item.id, () =>
                            updateStatusReservasi(item.id, "ditolak")
                          )
                        }
                      >
                        Tolak
                      </Button>
                    </>
                  )}

                  {statusKini === "disetujui" && !item.checkIn && (
                    <Button
                      variant="secondary"
                      loading={busy}
                      onClick={() => jalankan(item.id, () => checkIn(item.id))}
                    >
                      Check-in
                    </Button>
                  )}

                  {item.checkIn && !item.checkOut && (
                    <Button
                      variant="secondary"
                      loading={busy}
                      onClick={() => jalankan(item.id, () => checkOut(item.id))}
                    >
                      Check-out
                    </Button>
                  )}

                  {item.checkIn && (
                    <span className="self-center text-sm text-gray-500">
                      Masuk {item.checkIn}
                      {item.checkOut ? ` · Keluar ${item.checkOut}` : ""}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
