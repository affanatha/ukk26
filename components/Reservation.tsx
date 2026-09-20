import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { formatRupiah, formatTanggal, type Reservasi } from "@/lib/api";

export default function ReservationCard({
  reservasi,
  onCancel,
}: {
  reservasi: Reservasi;
  onCancel?: (id: number) => void;
}) {
  const bisaDibatalkan = ["menunggu", "disetujui"].includes(
    (reservasi.status || "").toLowerCase()
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {reservasi.namaSpace}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {formatTanggal(reservasi.tanggal)} · {reservasi.jamMulai}
            {reservasi.jamSelesai ? `–${reservasi.jamSelesai}` : ""} ·{" "}
            {reservasi.durasiJam} jam
          </p>

          {reservasi.kode && (
            <p className="mt-1 text-xs text-gray-400">Kode {reservasi.kode}</p>
          )}
        </div>

        <StatusBadge status={reservasi.status} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="font-bold text-blue-600">{formatRupiah(reservasi.total)}</p>

        <div className="flex gap-2">
          <Link
            href={`/member/ticket/${reservasi.id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Lihat e-ticket
          </Link>

          {onCancel && bisaDibatalkan && (
            <button
              id={`btn-batal-reservasi-${reservasi.id}`}
              data-testid="btn-batal-reservasi"
              onClick={() => onCancel(reservasi.id)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Batalkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
