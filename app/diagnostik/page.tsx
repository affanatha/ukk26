"use client";

import { useState } from "react";
import { API_BASE_URL, APP_KEY } from "@/lib/api";

type Hasil = {
  label: string;
  url: string;
  status: string;
  body: string;
};

const UJI = [
  { label: "Health check", path: "/health" },
  { label: "Daftar ruangan", path: "/api/spaces" },
  { label: "Tipe ruangan", path: "/api/spaces/types" },
];

export default function DiagnostikPage() {
  const [hasil, setHasil] = useState<Hasil[]>([]);
  const [loading, setLoading] = useState(false);

  const jalankan = async () => {
    setLoading(true);
    setHasil([]);

    const kumpulan: Hasil[] = [];

    for (const uji of UJI) {
      const url = `${API_BASE_URL}${uji.path}`;

      try {
        const response = await fetch(url, {
          headers: APP_KEY ? { "x-maker-key": APP_KEY } : {},
          cache: "no-store",
        });

        const text = await response.text();

        kumpulan.push({
          label: uji.label,
          url,
          status: `HTTP ${response.status}`,
          body: text.slice(0, 1500),
        });
      } catch (error) {
        kumpulan.push({
          label: uji.label,
          url,
          status: "Gagal terhubung",
          body: String(error),
        });
      }

      setHasil([...kumpulan]);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Diagnostik koneksi</h1>

        <p className="mt-2 text-gray-600">
          Halaman bantu untuk melihat balasan mentah dari server.
        </p>

        <dl className="mt-6 space-y-2 rounded-2xl bg-white p-6 text-sm shadow-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Base URL</dt>
            <dd className="font-mono text-gray-900">{API_BASE_URL}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">App key</dt>
            <dd className="font-mono text-gray-900">
              {APP_KEY ? `${APP_KEY.slice(0, 6)}…` : "BELUM DIISI"}
            </dd>
          </div>
        </dl>

        {!APP_KEY && (
          <p className="mt-4 rounded-xl bg-amber-50 p-5 text-amber-800">
            NEXT_PUBLIC_APP_KEY masih kosong. Isi di .env.local lalu jalankan
            ulang `npm run dev` — server Next.js hanya membaca env saat start.
          </p>
        )}

        <button
          onClick={jalankan}
          disabled={loading}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Menguji…" : "Jalankan uji koneksi"}
        </button>

        <div className="mt-6 space-y-4">
          {hasil.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-gray-900">{item.label}</p>
                <span className="text-sm font-medium text-gray-600">
                  {item.status}
                </span>
              </div>

              <p className="mt-1 font-mono text-xs text-gray-400">{item.url}</p>

              <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-gray-50 p-4 text-xs text-gray-700">
                {item.body || "(kosong)"}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
