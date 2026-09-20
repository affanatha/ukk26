"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToast } from "@/lib/toast-context";
import {
  checkAvailability,
  checkDiskon,
  formatRupiah,
  getErrorMessage,
  type Diskon,
} from "@/lib/api";
import { useSpace, useActiveDiskon } from "@/lib/hooks/useSpaces";
import { useCreateReservasiMutation } from "@/lib/hooks/useReservasi";
import { useRequireAuth } from "@/lib/auth-context";

function ReservationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceId = searchParams.get("spaceId");
  const { ready } = useRequireAuth(["member"]);
  const { showToast } = useToast();

  const { data: space, isLoading: loadingSpace, error: spaceErr } = useSpace(spaceId ?? undefined);
  const { data: activeDiscounts = [] } = useActiveDiskon();
  const createMutation = useCreateReservasiMutation();

  const today = new Date().toISOString().split("T")[0];
  const [tanggal, setTanggal] = useState(today);
  const [jamMulai, setJamMulai] = useState("09:00");
  const [durasi, setDurasi] = useState("2");

  // Promo states: either selected from dropdown or custom typed
  const [selectedDiskonId, setSelectedDiskonId] = useState<string>("");
  const [customPromoCode, setCustomPromoCode] = useState("");
  const [appliedDiskon, setAppliedDiskon] = useState<Diskon | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoSuccess, setPromoSuccess] = useState<boolean | null>(null);

  // Availability states
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const [formError, setFormError] = useState("");

  // Cek ketersediaan setiap kali tanggal, jam mulai, atau durasi berubah
  useEffect(() => {
    if (!space || !tanggal || !jamMulai || !durasi) {
      setIsAvailable(null);
      setAvailabilityMessage("");
      return;
    }

    let active = true;
    setCheckingAvailability(true);

    const timer = setTimeout(() => {
      checkAvailability({
        id_space: space.id,
        tanggal,
        jam_mulai: jamMulai,
        durasi_jam: durasi,
      })
        .then((res) => {
          if (!active) return;
          setIsAvailable(res.tersedia);
          setAvailabilityMessage(
            res.tersedia
              ? res.pesan || "Jadwal ini tersedia untuk dipesan."
              : res.pesan || "Jadwal sudah terisi, silakan pilih jam atau tanggal lain."
          );
        })
        .catch((err) => {
          if (!active) return;
          setIsAvailable(null);
          setAvailabilityMessage(getErrorMessage(err));
        })
        .finally(() => {
          if (active) setCheckingAvailability(false);
        });
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [space, tanggal, jamMulai, durasi]);

  // Handle diskon dari dropdown aktif
  const handleSelectDiscount = (idStr: string) => {
    setSelectedDiskonId(idStr);
    setCustomPromoCode("");
    setPromoMessage("");
    setPromoSuccess(null);

    if (!idStr) {
      setAppliedDiskon(null);
      return;
    }

    const found = activeDiscounts.find((d) => String(d.id) === idStr);
    if (found) {
      setAppliedDiskon(found);
      setPromoSuccess(true);
      setPromoMessage(`Diskon aktif "${found.nama}" diterapkan (${found.persentase}%).`);
    }
  };

  // Handle cek promo manual
  const handleCheckCustomPromo = async () => {
    const code = customPromoCode.trim();
    if (!code) return;

    setCheckingPromo(true);
    setPromoMessage("");
    setPromoSuccess(null);

    try {
      const diskon = await checkDiskon(code);
      setAppliedDiskon(diskon);
      setSelectedDiskonId("");
      setPromoSuccess(true);
      setPromoMessage(`Kode promo "${diskon.nama}" valid! Diskon ${diskon.persentase}%.`);
    } catch (err) {
      setAppliedDiskon(null);
      setPromoSuccess(false);
      setPromoMessage(getErrorMessage(err));
    } finally {
      setCheckingPromo(false);
    }
  };

  // Kalkulasi biaya
  const durasiNum = Math.max(1, Number(durasi) || 1);
  const hargaPerJam = space?.hargaPerJam ?? 0;
  const subtotal = hargaPerJam * durasiNum;
  const potongan = appliedDiskon
    ? Math.round((subtotal * appliedDiskon.persentase) / 100)
    : 0;
  const totalBayar = Math.max(0, subtotal - potongan);

  // Submit reservasi
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!space) return;

    if (isAvailable === false) {
      setFormError("Jadwal yang Anda pilih bentrok atau tidak tersedia.");
      return;
    }

    setFormError("");

    try {
      const reservasi = await createMutation.mutateAsync({
        id_space: space.id,
        tanggal_reservasi: tanggal,
        jam_mulai: jamMulai,
        durasi_jam: durasiNum,
        id_diskon: appliedDiskon?.id || undefined,
        kode_promo: appliedDiskon?.nama || undefined,
      });

      showToast("Pemesanan berhasil dibuat!", "success");
      // Redirect ke status pemesanan
      router.push("/member");
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  if (!ready || loadingSpace) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <p className="text-gray-500 font-medium">Memuat data ruangan...</p>
      </main>
    );
  }

  if (!space || spaceErr) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-900">Ruangan Tidak Ditemukan</h1>
          <p className="mt-2 text-sm text-gray-500">
            {spaceErr ? getErrorMessage(spaceErr) : `Ruangan dengan ID ${spaceId} tidak tersedia.`}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Pilih Ruangan Lain
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href={`/member/${space.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            ← Kembali ke detail {space.nama}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Form Pemesanan Space
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi data jadwal dan promo untuk menyelesaikan reservasi.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-12 items-start">
          {/* Kolom Form Input (7 col) */}
          <div className="md:col-span-7 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Jadwal & Detail Reservasi
            </h2>

            {formError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tanggal Reservasi
                </label>
                <input
                  type="date"
                  id="input-tanggal"
                  required
                  min={today}
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    id="input-jam-mulai"
                    required
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Durasi Pemakaian
                  </label>
                  <select
                    id="select-durasi"
                    value={durasi}
                    onChange={(e) => setDurasi(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((jam) => (
                      <option key={jam} value={jam}>
                        {jam} Jam
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Ketersediaan Real-time */}
              <div
                id="availability-status"
                className={`rounded-xl px-4 py-3 text-xs font-medium border transition ${
                  checkingAvailability
                    ? "bg-gray-50 border-gray-200 text-gray-500"
                    : isAvailable === true
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isAvailable === false
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {checkingAvailability
                  ? "Sedang memeriksa ketersediaan jadwal..."
                  : availabilityMessage || "Pilih jadwal untuk melihat ketersediaan."}
              </div>

              {/* Bagian Diskon & Kode Promo */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Voucher / Diskon
                </label>

                {/* Dropdown Diskon Aktif */}
                {activeDiscounts.length > 0 && (
                  <div className="mb-3">
                    <select
                      id="select-active-diskon"
                      value={selectedDiskonId}
                      onChange={(e) => handleSelectDiscount(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500"
                    >
                      <option value="">Pilih promo aktif tersedia...</option>
                      {activeDiscounts.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {d.nama} (Potongan {d.persentase}%)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Input Kode Promo Manual */}
                <div className="flex gap-2">
                  <input
                    id="input-kode-promo"
                    value={customPromoCode}
                    onChange={(e) => {
                      setCustomPromoCode(e.target.value);
                      setSelectedDiskonId("");
                    }}
                    placeholder="Atau ketik kode voucher..."
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    loading={checkingPromo}
                    onClick={handleCheckCustomPromo}
                    className="px-4 py-2 text-xs"
                  >
                    Terapkan
                  </Button>
                </div>

                {promoMessage && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      promoSuccess ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                id="btn-submit-reservasi"
                disabled={isAvailable === false}
                loading={createMutation.isPending}
                className="w-full py-3.5 mt-4 text-base font-semibold"
              >
                Konfirmasi & Buat Reservasi
              </Button>
            </form>
          </div>

          {/* Kolom Ringkasan Biaya & Space (5 col) */}
          <div className="md:col-span-5 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Ringkasan Pesanan
            </h2>

            <div className="flex gap-4 items-center">
              <img
                src={space.gambar}
                alt={space.nama}
                className="h-20 w-24 rounded-xl object-cover border border-gray-100"
              />
              <div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                  {space.tipe}
                </span>
                <h3 className="font-bold text-gray-900 mt-1">{space.nama}</h3>
                <p className="text-xs text-gray-500">
                  Tarif: {formatRupiah(space.hargaPerJam)} / jam
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tanggal</span>
                <span className="font-medium text-gray-900">{tanggal || "-"}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Jam & Durasi</span>
                <span className="font-medium text-gray-900">
                  {jamMulai} ({durasiNum} Jam)
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({durasiNum} × {formatRupiah(hargaPerJam)})</span>
                <span className="font-medium text-gray-900">{formatRupiah(subtotal)}</span>
              </div>

              {appliedDiskon && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Potongan Diskon ({appliedDiskon.nama} - {appliedDiskon.persentase}%)
                  </span>
                  <span className="font-semibold">−{formatRupiah(potongan)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-base font-bold text-gray-900">Total Pembayaran</span>
                <span className="text-xl font-extrabold text-blue-600" id="total-bayar-text">
                  {formatRupiah(totalBayar)}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/60 p-4 text-xs text-blue-800 leading-relaxed">
              💡 Reservasi Anda akan masuk ke status <strong>Belum Dikonfirmasi</strong> untuk diverifikasi pengelola coworking space.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ReservationPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<main className="p-10 text-gray-500">Memuat formulir pemesanan…</main>}>
        <ReservationForm />
      </Suspense>
    </>
  );
}
