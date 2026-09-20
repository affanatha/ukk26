import { API_ORIGIN } from "./client";

/* ------------------------------------------------------------------ */
/* Tipe domain                                                         */
/* ------------------------------------------------------------------ */

export type Role = "member" | "admin_space" | "admin" | string;

export type User = {
  id: number | string | null;
  username: string;
  role: Role;
  nama: string;
  /** Field mentah dari server, untuk data yang tidak ikut dinormalisasi */
  raw: Record<string, unknown>;
};

export type Space = {
  id: number;
  nama: string;
  tipe: string;
  deskripsi: string;
  hargaPerJam: number;
  kapasitas: number | null;
  fasilitas: string[];
  gambar: string;
  raw: Record<string, unknown>;
};

export type StatusReservasi =
  | "menunggu"
  | "disetujui"
  | "ditolak"
  | "dibatalkan"
  | "selesai"
  | string;

export type Reservasi = {
  id: number;
  kode: string;
  idSpace: number | null;
  namaSpace: string;
  namaMember: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  durasiJam: number;
  total: number;
  status: StatusReservasi;
  checkIn: string | null;
  checkOut: string | null;
  raw: Record<string, unknown>;
};

export type Diskon = {
  id: number;
  nama: string;
  persentase: number;
  tanggalMulai: string;
  tanggalBerakhir: string;
  raw: Record<string, unknown>;
};

export type Member = {
  id: number;
  username: string;
  nama: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto: string;
  raw: Record<string, unknown>;
};

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */

type Raw = Record<string, any>;

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="22">Tanpa gambar</text></svg>`
  );

function pick(raw: Raw, keys: string[], fallback: any = undefined) {
  for (const key of keys) {
    const value = raw?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}

function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Server mengembalikan nama file (mis. "space_a.jpg"), bukan URL penuh.
 * Kalau ternyata path folder uploads di server berbeda, cukup ubah di sini.
 */
export function resolveImageUrl(value: unknown, folder = "spaces"): string {
  if (typeof value !== "string" || !value) return PLACEHOLDER_IMAGE;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  return `${API_ORIGIN}/uploads/${folder}/${value}`;
}

/** API kadang mengembalikan array langsung, kadang { items: [] } / { rows: [] }. */
export function toArray(value: unknown): Raw[] {
  if (Array.isArray(value)) return value as Raw[];
  if (value && typeof value === "object") {
    const obj = value as Raw;
    for (const key of ["data", "items", "rows", "result", "list"]) {
      if (Array.isArray(obj[key])) return obj[key] as Raw[];
    }
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Normalizer                                                          */
/* ------------------------------------------------------------------ */

export function normalizeUser(raw: Raw = {}): User {
  const source = raw?.user ?? raw?.member ?? raw?.admin ?? raw;

  return {
    id: pick(source, ["id", "id_user", "id_member", "id_admin"], null),
    username: pick(source, ["username", "user_name"], ""),
    role: pick(source, ["role", "level", "tipe_user"], "member"),
    nama: pick(
      source,
      ["nama_member", "nama_coworking", "nama", "name", "nama_pemilik", "username"],
      ""
    ),
    raw: source ?? {},
  };
}

export function normalizeSpace(raw: Raw = {}): Space {
  const fasilitas = pick(raw, ["fasilitas", "facilities"], []);

  return {
    id: num(pick(raw, ["id_space", "id", "space_id"], 0)),
    nama: pick(raw, ["nama_space", "nama", "name"], "Tanpa nama"),
    tipe: pick(raw, ["tipe_space", "tipe", "kategori", "type"], "-"),
    deskripsi: pick(raw, ["deskripsi", "description", "keterangan"], ""),
    hargaPerJam: num(pick(raw, ["harga_per_jam", "harga", "price"], 0)),
    kapasitas: pick(raw, ["kapasitas", "capacity"], null),
    fasilitas: Array.isArray(fasilitas)
      ? fasilitas.map(String)
      : String(fasilitas)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    gambar: resolveImageUrl(pick(raw, ["foto", "gambar", "image", "foto_space"])),
    raw,
  };
}

export function normalizeReservasi(raw: Raw = {}): Reservasi {
  const space = raw?.space ?? raw?.spaces ?? {};
  const member = raw?.member ?? raw?.members ?? {};

  return {
    id: num(pick(raw, ["id_reservasi", "id", "reservasi_id"], 0)),
    kode: pick(raw, ["kode_reservasi", "kode", "code"], ""),
    idSpace: pick(raw, ["id_space", "space_id"], space?.id_space ?? null),
    namaSpace: pick(
      raw,
      ["nama_space"],
      pick(space, ["nama_space", "nama", "name"], "-")
    ),
    namaMember: pick(
      raw,
      ["nama_member"],
      pick(member, ["nama_member", "nama", "username"], "-")
    ),
    tanggal: pick(raw, ["tanggal_reservasi", "tanggal", "date"], ""),
    jamMulai: pick(raw, ["jam_mulai", "start_time"], ""),
    jamSelesai: pick(raw, ["jam_selesai", "end_time"], ""),
    durasiJam: num(pick(raw, ["durasi_jam", "durasi", "duration"], 0)),
    total: num(
      pick(raw, ["total_bayar", "total_harga", "total", "harga_total"], 0)
    ),
    status: pick(raw, ["status", "status_reservasi"], "menunggu"),
    checkIn: pick(raw, ["waktu_check_in", "check_in", "checkin"], null),
    checkOut: pick(raw, ["waktu_check_out", "check_out", "checkout"], null),
    raw,
  };
}

export function normalizeDiskon(raw: Raw = {}): Diskon {
  return {
    id: num(pick(raw, ["id_diskon", "id"], 0)),
    nama: pick(raw, ["nama_diskon", "nama", "kode_promo", "code"], ""),
    persentase: num(
      pick(raw, ["persentase_diskon", "persentase", "diskon", "percentage"], 0)
    ),
    tanggalMulai: pick(raw, ["tanggal_mulai", "start_date"], ""),
    tanggalBerakhir: pick(
      raw,
      ["tanggal_berakhir", "tanggal_selesai", "end_date"],
      ""
    ),
    raw,
  };
}

export function normalizeMember(raw: Raw = {}): Member {
  return {
    id: num(pick(raw, ["id_member", "id"], 0)),
    username: pick(raw, ["username"], ""),
    nama: pick(raw, ["nama_member", "nama", "name"], ""),
    instansi: pick(raw, ["instansi", "institution"], ""),
    alamat: pick(raw, ["alamat", "address"], ""),
    telp: pick(raw, ["telp", "no_telp", "phone"], ""),
    foto: resolveImageUrl(pick(raw, ["foto", "image"]), "members"),
    raw,
  };
}

/* ------------------------------------------------------------------ */
/* Format                                                              */
/* ------------------------------------------------------------------ */

export function formatRupiah(value: number): string {
  return `Rp ${num(value).toLocaleString("id-ID")}`;
}

export function formatTanggal(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
