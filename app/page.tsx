"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SpaceCard from "@/components/SpaceCard";
import { getErrorMessage, getSpaces, getSpaceTypes, type Space } from "@/lib/api";

export default function HomePage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [tipeList, setTipeList] = useState<string[]>([]);
  const [tipe, setTipe] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSpaceTypes().then(setTipeList).catch(() => setTipeList([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");

      getSpaces({ tipe: tipe || undefined, search: search || undefined })
        .then(setSpaces)
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [tipe, search]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-8">
        <div className="mx-auto mb-8 max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Reservasi Coworking Space
          </h1>

          <p className="mt-2 text-gray-600">
            Pilih tempat kerja terbaik sesuai kebutuhanmu hari ini.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama ruangan"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 sm:max-w-sm"
            />

            <select
              value={tipe}
              onChange={(event) => setTipe(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="">Semua tipe</option>
              {tipeList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          {loading && <p className="text-gray-500">Memuat ruangan…</p>}

          {!loading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && spaces.length === 0 && (
            <p className="text-gray-500">
              Belum ada ruangan yang cocok. Coba ubah kata kunci atau tipe.
            </p>
          )}

          {!loading && !error && spaces.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {spaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
