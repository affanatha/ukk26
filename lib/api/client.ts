/**
 * Client HTTP dasar untuk API Coworking Space (UKK Paket B).
 *
 * Semua request otomatis mendapat header:
 *   x-maker-key   -> app key dari /api/maker/login
 *   Authorization -> Bearer <jwt> (kalau opsi auth = true)
 */

/**
 * Default-nya "/backend", yaitu proxy same-origin yang didefinisikan di
 * next.config.ts. Memanggil domain server langsung dari browser akan diblokir
 * CORS, jadi jangan diganti ke URL absolut kecuali server sudah mengizinkan
 * origin aplikasi ini.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "/backend"
).replace(/\/$/, "");

/** URL absolut server, dipakai untuk menyusun alamat gambar. */
export const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  "https://learn.smktelkom-mlg.sch.id/coworking"
).replace(/\/$/, "");

/** Batas waktu satu request (ms) supaya UI tidak menggantung selamanya. */
export const REQUEST_TIMEOUT = 20000;

export const DEFAULT_APP_KEY = "mk_4074a468666d44ee9a1f93067d094d76";

export function getAppKey(): string {
  const envKey = (process.env.NEXT_PUBLIC_APP_KEY ?? "").trim();
  if (envKey && envKey !== "mk_example_key") {
    if (typeof window !== "undefined") {
      const current = window.localStorage.getItem("coworking_app_key");
      if (current !== envKey) {
        window.localStorage.setItem("coworking_app_key", envKey);
      }
    }
    return envKey;
  }
  if (typeof window !== "undefined") {
    const fromStorage = window.localStorage.getItem("coworking_app_key");
    if (fromStorage && fromStorage.trim() && fromStorage.trim() !== "mk_example_key") {
      return fromStorage.trim();
    }
  }
  return DEFAULT_APP_KEY;
}

export const APP_KEY =
  process.env.NEXT_PUBLIC_APP_KEY &&
  process.env.NEXT_PUBLIC_APP_KEY.trim() !== "mk_example_key"
    ? process.env.NEXT_PUBLIC_APP_KEY.trim()
    : DEFAULT_APP_KEY;

export const TOKEN_KEY = "coworking_token";
export const USER_KEY = "coworking_user";
export const MAKER_ID_KEY = "coworking_maker_id";

/* ------------------------------------------------------------------ */
/* Cookie Helpers                                                     */
/* ------------------------------------------------------------------ */

export function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = encodeURIComponent(name) + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const val = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(val);
      } catch {
        return val;
      }
    }
  }
  return null;
}

export function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

/* ------------------------------------------------------------------ */
/* Token & Maker storage                                              */
/* ------------------------------------------------------------------ */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const localToken = window.localStorage.getItem(TOKEN_KEY);
  if (localToken) return localToken;

  const cookieToken = getCookie(TOKEN_KEY);
  if (cookieToken) {
    window.localStorage.setItem(TOKEN_KEY, cookieToken);
    return cookieToken;
  }
  return null;
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  setCookie(TOKEN_KEY, token, 7);
}

export function getMakerIdFromToken(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const token = getToken();
    if (!token || !token.includes(".")) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    if (parsed?.maker_id) return Number(parsed.maker_id);
    if (parsed?.id_maker) return Number(parsed.id_maker);
    return null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(MAKER_ID_KEY);
  removeCookie(TOKEN_KEY);
  removeCookie(USER_KEY);
  removeCookie(MAKER_ID_KEY);
}

/* ------------------------------------------------------------------ */
/* Error                                                               */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/* ------------------------------------------------------------------ */
/* Request                                                             */
/* ------------------------------------------------------------------ */

type Query = Record<string, string | number | boolean | undefined | null>;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Dikirim sebagai JSON body */
  body?: unknown;
  /** Dikirim sebagai multipart/form-data (untuk upload) */
  formData?: FormData;
  /** Sertakan header Authorization. Default: false */
  auth?: boolean;
  /** Query string */
  query?: Query;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: Query) {
  const base = API_BASE_URL + (path.startsWith("/") ? path : `/${path}`);

  if (!query) return base;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Banyak API menyelubungi payload dalam { success, message, data }.
 * Fungsi ini mengambil isi `data` bila ada, selain itu mengembalikan apa adanya.
 */
function unwrap<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in (json as object)) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, formData, auth = false, query, signal } = options;

  const appKey = getAppKey();
  const headers: Record<string, string> = {};

  if (appKey) {
    headers["x-maker-key"] = appKey;
    headers["X-Maker-Key"] = appKey;
  }
  if (!formData) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Tidak bisa terhubung ke server. Pastikan aplikasi dijalankan lewat `npm run dev` (proxy /backend) dan jaringan sekolah bisa mengakses server.",
      0
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let json: unknown = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }

  if (!response.ok) {
    const payload = json as { message?: string; error?: string } | null;
    const message =
      payload?.message ||
      payload?.error ||
      `Request gagal (HTTP ${response.status})`;

    if (response.status === 401) clearSession();

    throw new ApiError(message, response.status, json);
  }

  return unwrap<T>(json);
}

/** Versi yang mengembalikan seluruh body response tanpa membuka `data`. */
export async function apiFetchRaw<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const result = await apiFetch<T>(path, options);
  return result;
}

/** Ambil pesan error yang layak ditampilkan ke user. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan yang tidak diketahui.";
}
