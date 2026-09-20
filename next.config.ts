import type { NextConfig } from "next";

const API_ORIGIN =
  process.env.API_ORIGIN ?? "https://learn.smktelkom-mlg.sch.id/coworking";

const nextConfig: NextConfig = {
  /**
   * Browser tidak boleh memanggil learn.smktelkom-mlg.sch.id secara langsung:
   * header x-maker-key memicu preflight CORS yang tidak dijawab server, sehingga
   * request menggantung selamanya.
   *
   * Semua request diarahkan ke /backend (same-origin), lalu Next.js yang
   * meneruskannya ke server asli. Tidak ada CORS sama sekali.
   */
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/Login",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/auth/Register",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
