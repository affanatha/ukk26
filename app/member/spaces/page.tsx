"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SpaceCard from "@/components/SpaceCard";
import { getErrorMessage, getSpaces, type Space } from "@/lib/api";

export default function MemberSpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");

      getSpaces({ search: search || undefined })
        .then(setSpaces)
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">Daftar ruangan</h1>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari ruangan"
            className="mt-6 w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
          />

          {loading && <p className="mt-6 text-gray-500">Memuat…</p>}

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
