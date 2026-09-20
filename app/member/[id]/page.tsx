"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  formatRupiah,
  getErrorMessage,
  getSpace,
  type Space,
} from "@/lib/api";

export default function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getSpace(id)
      .then(setSpace)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="p-10 text-gray-500">Memuat detail ruangan…</main>
      </>
    );
  }

  if (error || !space) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center p-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <h1 className="text-2xl font-bold text-gray-900">
              Ruangan tidak ditemukan
            </h1>

            <p className="mt-3 text-gray-500">{error || `ID space: ${id}`}</p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white"
            >
              Kembali ke beranda
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="font-medium text-blue-600">
            ← Kembali
          </Link>

          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-md">
            <img
              src={space.gambar}
              alt={space.nama}
              className="h-80 w-full object-cover"
            />

            <div className="p-8">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                {space.tipe}
              </span>

              <h1 className="mt-4 text-4xl font-bold text-gray-900">
                {space.nama}
              </h1>

              <p className="mt-4 text-gray-600">{space.deskripsi}</p>

              {space.kapasitas !== null && (
                <p className="mt-3 text-sm text-gray-500">
                  Kapasitas {space.kapasitas} orang
                </p>
              )}

              {space.fasilitas.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {space.fasilitas.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm text-gray-500">Harga per jam</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatRupiah(space.hargaPerJam)}
                </p>
              </div>

              <Link
                href={`/member/reservation?spaceId=${space.id}`}
                className="mt-8 block w-full rounded-xl bg-blue-600 py-4 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                Pesan ruangan ini
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
