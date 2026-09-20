"use client";

import { useState, useDeferredValue } from "react";
import Navbar from "@/components/Navbar";
import SpaceCard from "@/components/SpaceCard";
import { SpaceCardSkeleton } from "@/components/ui/Skeleton";
import { useSpaces, useSpaceTypes } from "@/lib/hooks/useSpaces";

export default function HomePage() {
  const [tipe, setTipe] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data: tipeList = [], isLoading: loadingTypes } = useSpaceTypes();
  const {
    data: spaces = [],
    isLoading: loadingSpaces,
    error,
  } = useSpaces({
    tipe: tipe || undefined,
    search: deferredSearch || undefined,
  });

  const allTypes = ["", ...tipeList];

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto mb-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                Ketersediaan Space
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                Pilih Ruangan Coworking Terbaik
              </h1>
              <p className="mt-1.5 text-sm text-gray-600">
                Temukan meja kerja personal, ruang meeting, hingga kantor privat sesuai kebutuhan Anda.
              </p>
            </div>

            <div className="w-full md:w-80">
              <input
                id="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama ruangan..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
              />
            </div>
          </div>

          {/* Tab Filter Tipe */}
          <div className="mt-6 flex flex-wrap gap-2 items-center" id="tab-tipe-filter">
            {allTypes.map((item) => {
              const active = tipe === item;
              const label = item === "" ? "Semua Ruangan" : item;
              return (
                <button
                  key={item || "all"}
                  type="button"
                  onClick={() => setTipe(item)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 mb-6"
            >
              Gagal memuat daftar ruangan. Silakan periksa koneksi atau app key.
            </div>
          )}

          {loadingSpaces ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SpaceCardSkeleton key={idx} />
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <p className="text-base font-semibold text-gray-800">
                Tidak ada ruangan ditemukan
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Coba sesuaikan kata kunci pencarian atau pilih filter tipe lainnya.
              </p>
              {(tipe || search) && (
                <button
                  onClick={() => {
                    setTipe("");
                    setSearch("");
                  }}
                  className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  href={`/member/reservation?spaceId=${space.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
