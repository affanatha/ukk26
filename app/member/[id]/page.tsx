"use client";

import { use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { formatRupiah, getErrorMessage } from "@/lib/api";
import { useSpace } from "@/lib/hooks/useSpaces";

export default function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: space, isLoading, error } = useSpace(id);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center p-6 text-gray-500">
          Memuat detail ruangan…
        </main>
      </>
    );
  }

  if (error || !space) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center p-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-100 max-w-md w-full">
            <h1 className="text-xl font-bold text-gray-900">
              Ruangan Tidak Ditemukan
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {error ? getErrorMessage(error) : `Ruangan dengan ID ${id} tidak ditemukan.`}
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Kembali ke Beranda
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
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            ← Kembali ke Katalog
          </Link>

          <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
            <div className="h-80 w-full bg-gray-100">
              <img
                src={space.gambar}
                alt={space.nama}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                  {space.tipe}
                </span>
                {space.kapasitas && (
                  <span className="text-xs font-medium text-gray-500">
                    Kapasitas hingga {space.kapasitas} orang
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-bold text-gray-900" id="space-title">
                {space.nama}
              </h1>

              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                {space.deskripsi || "Ruang kerja modern dengan koneksi internet berkecepatan tinggi dan suasana kondusif untuk produktivitas."}
              </p>

              {space.fasilitas && space.fasilitas.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fasilitas Ruangan
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {space.fasilitas.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Tarif Sewa</p>
                  <p className="text-2xl font-extrabold text-blue-600">
                    {formatRupiah(space.hargaPerJam)}{" "}
                    <span className="text-xs font-normal text-gray-500">/ jam</span>
                  </p>
                </div>

                <Link
                  id="btn-pesan-dari-detail"
                  href={`/member/reservation?spaceId=${space.id}`}
                  className="rounded-xl bg-blue-600 px-8 py-3.5 text-center text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
                >
                  Pesan Ruangan Sekarang
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
