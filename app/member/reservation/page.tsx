"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import {
  checkAvailability,
  checkDiskon,
  createReservasi,
  formatRupiah,
  getErrorMessage,
  getSpace,
  type Diskon,
  type Space,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/auth-context";

function ReservationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceId = searchParams.get("spaceId");
  const { ready } = useRequireAuth(["member"]);

  const [space, setSpace] = useState<Space | null>(null);
  const [loadingSpace, setLoadingSpace] = useState(true);
  const [spaceError, setSpaceError] = useState("");

  const [tanggal, setTanggal] = useState("");
  const [jamMulai, setJamMulai] = useState("");
  const [durasi, setDurasi] = useState("1");
  const [kodePromo, setKodePromo] = useState("");

  const [diskon, setDiskon] = useState<Diskon | null>(null);
  const [promoPesan, setPromoPesan] = useState("");
  const [cekPromo, setCekPromo] = useState(false);

  const [ketersediaan, setKetersediaan] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!spaceId) {
      setLoadingSpace(false);
      return;
    }

    getSpace(spaceId)
      .then(setSpace)
      .catch((err) => setSpaceError(getErrorMessage(err)))
      .finally(() => setLoadingSpace(false));
  }, [spaceId]);

  // Cek ketersediaan tiap kali tanggal / jam / durasi berubah.
  useEffect(() => {
    if (!space || !tanggal || !jamMulai) {
      setKetersediaan("");
      return;
    }

    let aktif = true;

    checkAvailability({
      id_space: space.id,
      tanggal,
      jam_mulai: jamMulai,
      durasi_jam: durasi,
    })
      .then((hasil) => {
        if (!aktif) return;
        setKetersediaan(
          hasil.tersedia
            ? hasil.pesan || "Jadwal tersedia."
            : hasil.pesan || "Jadwal sudah terisi, pilih jam lain."
        );
      })
      .catch(() => aktif && setKetersediaan(""));

    return () => {
      aktif = false;
    };
  }, [space, tanggal, jamMulai, durasi]);

  const subtotal = useMemo(
    () => (space ? space.hargaPerJam * Number(durasi) : 0),
    [space, durasi]
  );

  const potongan = diskon ? Math.round((subtotal * diskon.persentase) / 100) : 0;
  const total = subtotal - potongan;

  const terapkanPromo = async () => {
    if (!kodePromo) return;

    setCekPromo(true);
    setPromoPesan("");

    try {
      const hasil = await checkDiskon(kodePromo);
      setDiskon(hasil);
      setPromoPesan(`Diskon ${hasil.persentase}% diterapkan.`);
    } catch (err) {
      setDiskon(null);
      setPromoPesan(getErrorMessage(err));
    } finally {
      setCekPromo(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!space) return;

    setSubmitting(true);
    setError("");

    try {
      const reservasi = await createReservasi({
        id_space: space.id,
        tanggal_reservasi: tanggal,
        jam_mulai: jamMulai,
        durasi_jam: Number(durasi),
        id_diskon: diskon?.id || undefined,
        kode_promo: diskon ? diskon.nama : undefined,
      });

      router.push(
        reservasi.id ? `/member/ticket/${reservasi.id}` : "/member"
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || loadingSpace) {
    return <main className="p-10 text-gray-500">Memuat…</main>;
  }

  if (!space) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <h1 className="text-2xl font-bold text-gray-900">
            Ruangan tidak ditemukan
          </h1>

          <p className="mt-3 text-gray-500">
            {spaceError || `ID space: ${spaceId ?? "tidak ada"}`}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link href={`/member/${space.id}`} className="font-medium text-blue-600">
          ← Kembali ke detail
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Reservasi ruangan
        </h1>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 text-gray-900 shadow-md">
            <h2 className="mb-6 text-xl font-bold">Data reservasi</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block font-medium">Ruangan</label>
                <input
                  value={space.nama}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Tanggal</label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(event) => setTanggal(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Jam mulai</label>
                <input
                  type="time"
                  required
                  value={jamMulai}
                  onChange={(event) => setJamMulai(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Durasi</label>
                <select
                  value={durasi}
                  onChange={(event) => setDurasi(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  {Array.from({ length: 8 }, (_, index) => index + 1).map((jam) => (
                    <option key={jam} value={jam}>
                      {jam} jam
                    </option>
                  ))}
                </select>
              </div>

              {ketersediaan && (
                <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {ketersediaan}
                </p>
              )}

              <div>
                <label className="mb-2 block font-medium">Kode promo</label>

                <div className="flex gap-2">
                  <input
                    value={kodePromo}
                    onChange={(event) => setKodePromo(event.target.value)}
                    placeholder="Opsional"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    loading={cekPromo}
                    onClick={terapkanPromo}
                  >
                    Terapkan
                  </Button>
                </div>

                {promoPesan && (
                  <p
                    className={`mt-2 text-sm ${
                      diskon ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {promoPesan}
                  </p>
                )}
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" loading={submitting} className="w-full py-3">
                Konfirmasi reservasi
              </Button>
            </form>
          </div>

          <div className="h-fit rounded-2xl bg-white p-6 text-gray-900 shadow-md">
            <h2 className="text-xl font-bold">Ringkasan</h2>

            <img
              src={space.gambar}
              alt={space.nama}
              className="mt-5 h-48 w-full rounded-xl object-cover"
            />

            <h3 className="mt-4 text-xl font-bold">{space.nama}</h3>
            <p className="mt-1 text-gray-500">{space.tipe}</p>

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
              <div className="flex justify-between">
                <span>Harga / jam</span>
                <span>{formatRupiah(space.hargaPerJam)}</span>
              </div>

              <div className="flex justify-between">
                <span>Durasi</span>
                <span>{durasi} jam</span>
              </div>

              {diskon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon {diskon.persentase}%</span>
                  <span>−{formatRupiah(potongan)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-100 pt-4">
                <span className="font-bold">Total</span>
                <span className="font-bold text-blue-600">
                  {formatRupiah(total)}
                </span>
              </div>
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
      <Suspense fallback={<main className="p-10 text-gray-500">Memuat…</main>}>
        <ReservationForm />
      </Suspense>
    </>
  );
}
