"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ReservationCard from "@/components/Reservation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/lib/toast-context";
import { getErrorMessage, type Reservasi } from "@/lib/api";
import { useMyReservasi, useCancelReservasiMutation } from "@/lib/hooks/useReservasi";
import { useRequireAuth } from "@/lib/auth-context";

const STATUS_FILTERS = [
  { label: "Semua", value: "" },
  { label: "Belum Dikonfirmasi", value: "menunggu" },
  { label: "Disetujui", value: "disetujui" },
  { label: "Aktif", value: "aktif" },
  { label: "Selesai", value: "selesai" },
  { label: "Dibatalkan", value: "dibatalkan" },
];

export default function MemberDashboardPage() {
  const { user, ready } = useRequireAuth(["member"]);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedIdToCancel, setSelectedIdToCancel] = useState<number | null>(null);

  const { data: rawItems = [], isLoading, error, refetch } = useMyReservasi(ready);
  const cancelMutation = useCancelReservasiMutation();

  // Urutkan reservasi terbaru di atas
  const sortedItems = useMemo(() => {
    return [...rawItems].sort((a, b) => b.id - a.id);
  }, [rawItems]);

  // Filter berdasarkan tab status
  const filteredItems = useMemo(() => {
    if (!activeTab) return sortedItems;
    return sortedItems.filter((item) => {
      const status = (item.status || "").toLowerCase().trim();
      if (activeTab === "menunggu") {
        return status === "menunggu" || status === "belum dikonfirmasi";
      }
      return status === activeTab;
    });
  }, [sortedItems, activeTab]);

  const handleOpenCancel = (id: number) => {
    setSelectedIdToCancel(id);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedIdToCancel) return;
    try {
      await cancelMutation.mutateAsync(selectedIdToCancel);
      showToast("Reservasi berhasil dibatalkan.", "info");
      setCancelModalOpen(false);
      setSelectedIdToCancel(null);
      refetch();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  if (!ready) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center p-6 text-gray-500">
          Memeriksa sesi login...
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          {/* Header Dashboard Member */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Status Pemesanan
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                Halo, {user?.nama || user?.username}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Kelola jadwal pemesanan coworking space dan pantau status persetujuan.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/member/history"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs"
              >
                Histori Pemesanan
              </Link>
              <Link
                href="/"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
              >
                + Pesan Ruangan
              </Link>
            </div>
          </div>

          {/* Tab Filter Status */}
          <div className="mt-6 flex flex-wrap gap-2 items-center" id="tab-status-filter">
            {STATUS_FILTERS.map((tab) => {
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value || "semua"}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {getErrorMessage(error)}
            </div>
          )}

          {isLoading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 animate-pulse h-32"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <p className="text-base font-semibold text-gray-800">
                Belum ada reservasi dengan status ini
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Silakan pilih kategori status lain atau buat reservasi baru.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Cari Ruangan Tersedia
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredItems.map((item) => (
                <ReservationCard
                  key={item.id}
                  reservasi={item}
                  onCancel={handleOpenCancel}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Konfirmasi Pembatalan */}
      <ConfirmDialog
        open={cancelModalOpen}
        title="Batalkan Reservasi"
        message="Apakah Anda yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat diurungkan."
        confirmText="Ya, Batalkan"
        cancelText="Tutup"
        variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedIdToCancel(null);
        }}
      />
    </>
  );
}
