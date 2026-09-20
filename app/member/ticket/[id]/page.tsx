"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import {
  formatRupiah,
  formatTanggal,
  getErrorMessage,
  getETicket,
  type ETicket,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-context";

export default function ETicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { ready } = useRequireAuth(["member"]);

  const [ticket, setTicket] = useState<ETicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;

    setLoading(true);
    setError("");

    getETicket(id)
      .then(setTicket)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [ready, id]);

  if (!ready || loading) {
    return (
      <>
        <Navbar />
        <main className="p-10 text-gray-500">Memuat e-ticket…</main>
      </>
    );
  }

  if (error || !ticket) {
    return (
      <>
        <Navbar />
        <main className="p-10">
          <p className="rounded-xl bg-red-50 p-5 text-red-700">
            {error || "E-ticket tidak ditemukan."}
          </p>

          <Link href="/member" className="mt-6 inline-block text-blue-600">
            ← Kembali
          </Link>
        </main>
      </>
    );
  }

  const { reservasi } = ticket;

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-md">
          <Link href="/member" className="font-medium text-blue-600">
            ← Kembali
          </Link>

          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="text-sm text-gray-500">E-ticket reservasi</p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {reservasi.namaSpace}
            </h1>

            <div className="mt-6 flex justify-center rounded-xl bg-gray-50 p-6">
              <QRCodeSVG value={ticket.qrValue} size={180} />
            </div>

            {reservasi.kode && (
              <p className="mt-4 font-mono text-sm text-gray-600">
                {reservasi.kode}
              </p>
            )}

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-6 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Atas nama</span>
                <span className="font-medium text-gray-900">
                  {reservasi.namaMember}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="font-medium text-gray-900">
                  {formatTanggal(reservasi.tanggal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Jam</span>
                <span className="font-medium text-gray-900">
                  {reservasi.jamMulai}
                  {reservasi.jamSelesai ? `–${reservasi.jamSelesai}` : ""}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Durasi</span>
                <span className="font-medium text-gray-900">
                  {reservasi.durasiJam} jam
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-blue-600">
                  {formatRupiah(reservasi.total)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={reservasi.status} />
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Tunjukkan QR ini ke admin saat check-in.
          </p>
        </div>
      </main>
    </>
  );
}
