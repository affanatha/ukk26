"use client";

import { useState, useDeferredValue } from "react";
import Navbar from "@/components/Navbar";
import SpaceCard from "@/components/SpaceCard";
import { SpaceCardSkeleton } from "@/components/ui/Skeleton";
import { useSpaces, useSpaceTypes } from "@/lib/hooks/useSpaces";

export default function MemberSpacesPage() {
  const [tipe, setTipe] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data: tipeList = [] } = useSpaceTypes();
  const {
    data: spaces = [],
    isLoading,
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
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Katalog Ruangan</h1>
              <p className="mt-1 text-sm text-gray-500">
                Pilih space yang sesuai untuk aktivitas kerja atau rapat Anda.
              </p>
            </div>

            <div className="w-full md:w-80">
              <input
                id="search-member-spaces"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama ruangan..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {allTypes.map((item) => {
              const active = tipe === item;
              return (
                <button
                  key={item || "all"}
                  type="button"
                  onClick={() => setTipe(item)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {item === "" ? "Semua Tipe" : item}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mb-6 rounded-xl bg-red-50 p-5 text-sm text-red-700">
              Gagal memuat ruangan.
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SpaceCardSkeleton key={i} />
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
              Tidak ada ruangan yang cocok.
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
