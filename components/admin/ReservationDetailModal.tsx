"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/lib/toast-context";
import { formatRupiah, formatTanggal, getErrorMessage, type Reservasi } from "@/lib/api";
import {
  useUpdateStatusReservasiMutation,
  useCheckInMutation,
  useCheckOutMutation,
} from "@/lib/hooks/useAdmin";

interface Props {
  reservasi: Reservasi | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const ALL_STATUSES = ["menunggu", "disetujui", "aktif", "selesai", "ditolak", "dibatalkan"];

export default function ReservationDetailModal({
  reservasi,
  open,
  onClose,
  onUpdated,
}: Props) {
  const { showToast } = useToast();
  const updateStatusMutation = useUpdateStatusReservasiMutation();
  const checkInMutation = useCheckInMutation();
  const checkOutMutation = useCheckOutMutation();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!reservasi) return null;

  const currentStatus = (reservasi.status || "").toLowerCase().trim();
  const canCheckIn = currentStatus === "disetujui" && !reservasi.checkIn;
  const canCheckOut =
    (currentStatus === "aktif" || Boolean(reservasi.checkIn)) && !reservasi.checkOut;
  const canCancel = currentStatus !== "dibatalkan" && currentStatus !== "selesai";

  const handleUpdateStatus = async (status: string) => {
    setLoadingAction(true);
    setErrorMsg("");
    try {
      await updateStatusMutation.mutateAsync({ id: reservasi.id, status });
      showToast(`Status reservasi diubah menjadi "${status}".`, "success");
      onUpdated?.();
      onClose();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCheckIn = async () => {
    setLoadingAction(true);
    setErrorMsg("");
    try {
      await checkInMutation.mutateAsync(reservasi.id);
      showToast("Check-in member berhasil dicatat.", "success");
      onUpdated?.();
      onClose();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCheckOut = async () => {
    setLoadingAction(true);
    setErrorMsg("");
    try {
      await checkOutMutation.mutateAsync(reservasi.id);
      showToast("Check-out member berhasil dicatat.", "success");
      onUpdated?.();
      onClose();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Modal
      open={open}
      title={`Kelola Reservasi #${reservasi.kode || reservasi.id}`}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm" id="modal-kelola-reservasi">
        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            {errorMsg}
          </div>
        )}

        {/* Informasi Utama Transaksi */}
        <div className="rounded-xl bg-gray-50 p-4 space-y-2 border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Ruangan:</span>
            <span className="font-bold text-gray-900">{reservasi.namaSpace}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Nama Member:</span>
            <span className="font-bold text-gray-900">{reservasi.namaMember}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Jadwal:</span>
            <span className="text-gray-800">
              {formatTanggal(reservasi.tanggal)} · {reservasi.jamMulai} ({reservasi.durasiJam} Jam)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Total Tarif:</span>
            <span className="font-extrabold text-blue-600 text-base">
              {formatRupiah(reservasi.total)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-500 font-medium">Status Saat Ini:</span>
            <StatusBadge status={reservasi.status} />
          </div>

          {(reservasi.checkIn || reservasi.checkOut) && (
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
              {reservasi.checkIn && <p>Waktu Check-In: {reservasi.checkIn}</p>}
              {reservasi.checkOut && <p>Waktu Check-Out: {reservasi.checkOut}</p>}
            </div>
          )}
        </div>

        {/* Form Ubah Status Manual */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Ubah Status Transaksi
          </label>
          <div className="flex gap-2">
            <select
              id="select-ubah-status"
              defaultValue={currentStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
            <Button
              id="btn-terapkan-status"
              loading={loadingAction}
              disabled={!selectedStatus || selectedStatus === currentStatus}
              onClick={() => handleUpdateStatus(selectedStatus)}
              className="px-4 py-2 text-xs"
            >
              Simpan
            </Button>
          </div>
        </div>

        {/* Tombol Aksi Cepat: Check-in, Check-out, Batalkan */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
          {canCheckIn && (
            <Button
              id="btn-checkin-modal"
              loading={loadingAction}
              onClick={handleCheckIn}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 py-2"
            >
              ✓ Konfirmasi Check-in
            </Button>
          )}

          {canCheckOut && (
            <Button
              id="btn-checkout-modal"
              loading={loadingAction}
              onClick={handleCheckOut}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs px-4 py-2"
            >
              ✓ Konfirmasi Check-out
            </Button>
          )}

          {canCancel && (
            <Button
              id="btn-batalkan-modal"
              variant="danger"
              loading={loadingAction}
              onClick={() => handleUpdateStatus("dibatalkan")}
              className="text-xs px-4 py-2"
            >
              Batalkan Reservasi
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="text-xs px-4 py-2"
          >
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
