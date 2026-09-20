"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { useToast } from "@/lib/toast-context";
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
  const { showToast } = useToast();

  const [ticket, setTicket] = useState<ETicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;

    setLoading(true);
    setError("");

    getETicket(id)
      .then(setTicket)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [ready, id]);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const shareData = {
      title: "E-Ticket Reservasi Coworking Space",
      text: `Tiket Reservasi #${ticket?.reservasi.kode || id} untuk ${ticket?.reservasi.namaSpace}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link tiket disalin ke clipboard!", "info");
    }
  };

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!ready || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center p-6 text-gray-500">
          Memuat e-ticket reservasi…
        </main>
      </>
    );
  }

  if (error || !ticket) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm max-w-md w-full">
            <h1 className="text-xl font-bold text-gray-900">E-Ticket Tidak Ditemukan</h1>
            <p className="mt-2 text-sm text-gray-500">
              {error || `Tiket dengan ID ${id} tidak dapat dimuat.`}
            </p>
            <Link
              href="/member"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Kembali ke Status Pemesanan
            </Link>
          </div>
        </main>
      </>
    );
  }

  const { reservasi } = ticket;
  const qrCodeValue =
    ticket.qrValue ||
    (ticket.raw as any)?.qr_code_payload ||
    (ticket.raw as any)?.qr_code ||
    reservasi.kode ||
    String(reservasi.id);

  // Perhitungan tarif kotor & diskon bila tersedia di raw atau kalkulasi durasi
  const rawData = (reservasi.raw as any) ?? {};
  const tarifKotor =
    Number(rawData.tarif_kotor) ||
    Number(rawData.subtotal) ||
    reservasi.total;
  const potonganDiskon =
    Number(rawData.potongan_diskon) ||
    Number(rawData.diskon) ||
    (tarifKotor > reservasi.total ? tarifKotor - reservasi.total : 0);

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-4 print:hidden">
            <Link
              href="/member"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Kembali ke Pemesanan
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                id="btn-share-ticket"
                onClick={handleShare}
                className="px-3 py-1.5 text-xs"
              >
                Bagikan
              </Button>
              <Button
                id="btn-download-ticket"
                onClick={handleDownload}
                className="px-3 py-1.5 text-xs"
              >
                Unduh / Cetak
              </Button>
            </div>
          </div>

          {/* Kartu E-Ticket Fisik */}
          <div
            ref={ticketRef}
            id="ticket-card-element"
            className="overflow-hidden rounded-3xl bg-white shadow-md border border-gray-100"
          >
            {/* Header Tiket */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
              <span className="rounded-full bg-white/20 backdrop-blur-xs px-3 py-0.5 text-xs font-medium">
                E-TICKET RESMI
              </span>
              <h1 className="mt-2 text-2xl font-bold">{reservasi.namaSpace}</h1>
              <p className="mt-1 text-xs text-blue-100">
                Kode Booking: <span className="font-mono font-bold tracking-wider">{reservasi.kode || `#${reservasi.id}`}</span>
              </p>
            </div>

            {/* Area QR Code */}
            <div className="p-6 text-center">
              <div className="mx-auto inline-flex rounded-2xl bg-gray-50 p-5 border border-gray-100 shadow-inner">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrCodeValue}
                  size={190}
                  level="H"
                />
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Tunjukkan QR Code ini ke petugas saat kedatangan (Check-in).
              </p>
            </div>

            {/* Pemisah Tiket Bergaya Perforasi */}
            <div className="relative flex items-center px-4">
              <div className="h-6 w-6 -ml-7 rounded-full bg-gray-50 border border-gray-200" />
              <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
              <div className="h-6 w-6 -mr-7 rounded-full bg-gray-50 border border-gray-200" />
            </div>

            {/* Rincian Detail Jadwal & Pembayaran */}
            <div className="p-6 space-y-3.5 text-xs text-gray-600">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Nama Pemesan</span>
                <span className="font-bold text-gray-900">{reservasi.namaMember}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tanggal Pemakaian</span>
                <span className="font-medium text-gray-900">{formatTanggal(reservasi.tanggal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Waktu & Durasi</span>
                <span className="font-medium text-gray-900">
                  {reservasi.jamMulai}
                  {reservasi.jamSelesai ? ` – ${reservasi.jamSelesai}` : ""}{" "}
                  ({reservasi.durasiJam} Jam)
                </span>
              </div>

              {/* Rincian Pembayaran */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Tarif Kotor</span>
                  <span>{formatRupiah(tarifKotor)}</span>
                </div>

                {potonganDiskon > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>Potongan Diskon</span>
                    <span>−{formatRupiah(potonganDiskon)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-sm">Total Dibayar</span>
                  <span className="font-extrabold text-blue-600 text-base" id="ticket-total-bayar">
                    {formatRupiah(reservasi.total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Status Reservasi</span>
                <StatusBadge status={reservasi.status} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
