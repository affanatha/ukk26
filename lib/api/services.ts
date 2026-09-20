import { apiFetch, setToken, clearSession, USER_KEY } from "./client";
import {
  normalizeDiskon,
  normalizeMember,
  normalizeReservasi,
  normalizeSpace,
  normalizeUser,
  toArray,
  type Diskon,
  type Member,
  type Reservasi,
  type Space,
  type User,
} from "./types";

/* ================================================================== */
/* AUTH                                                               */
/* ================================================================== */

export type LoginPayload = { username: string; password: string };

export type RegisterMemberPayload = {
  username: string;
  password: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string;
};

export type RegisterAdminPayload = {
  username: string;
  password: string;
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
};

export async function login(payload: LoginPayload): Promise<User> {
  const data = await apiFetch<Record<string, any>>("/api/auth/login", {
    method: "POST",
    body: payload,
  });

  const token =
    data?.token ?? data?.access_token ?? data?.accessToken ?? data?.jwt;

  if (!token) {
    throw new Error("Login berhasil tetapi token tidak ditemukan di response.");
  }

  setToken(token);

  const user = normalizeUser(data);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  return user;
}

export function logout() {
  clearSession();
}

export function registerMember(payload: RegisterMemberPayload) {
  return apiFetch<Record<string, any>>("/api/auth/register/member", {
    method: "POST",
    body: payload,
  });
}

export function registerAdminSpace(payload: RegisterAdminPayload) {
  return apiFetch<Record<string, any>>("/api/auth/register/admin-space", {
    method: "POST",
    body: payload,
  });
}

export async function getProfile(): Promise<User> {
  const data = await apiFetch<Record<string, any>>("/api/auth/profile", {
    auth: true,
  });
  return normalizeUser(data);
}

/* ================================================================== */
/* SPACES (publik)                                                    */
/* ================================================================== */

export async function getSpaces(params?: {
  tipe?: string;
  search?: string;
}): Promise<Space[]> {
  const data = await apiFetch<unknown>("/api/spaces", { query: params });
  return toArray(data).map(normalizeSpace);
}

export async function getSpace(id: string | number): Promise<Space> {
  const data = await apiFetch<Record<string, any>>(`/api/spaces/${id}`);
  return normalizeSpace(data);
}

export async function getSpaceTypes(): Promise<string[]> {
  const data = await apiFetch<unknown>("/api/spaces/types");
  return toArray(data).map((item: any) =>
    typeof item === "string"
      ? item
      : item?.tipe_space ?? item?.tipe ?? item?.nama ?? String(item)
  );
}

export type Availability = {
  tersedia: boolean;
  pesan: string;
  raw: Record<string, any>;
};

export async function checkAvailability(params: {
  id_space: number | string;
  tanggal: string;
  jam_mulai: string;
  durasi_jam: number | string;
}): Promise<Availability> {
  const data = await apiFetch<Record<string, any>>("/api/spaces/availability", {
    query: params,
  });

  const tersedia =
    data?.tersedia ?? data?.available ?? data?.is_available ?? true;

  return {
    tersedia: Boolean(tersedia),
    pesan: data?.message ?? data?.pesan ?? "",
    raw: data ?? {},
  };
}

/* ================================================================== */
/* DISKON                                                             */
/* ================================================================== */

export async function getActiveDiskon(): Promise<Diskon[]> {
  const data = await apiFetch<unknown>("/api/diskon/active");
  return toArray(data).map(normalizeDiskon);
}

export async function getDiskon(id: string | number): Promise<Diskon> {
  const data = await apiFetch<Record<string, any>>(`/api/diskon/${id}`);
  return normalizeDiskon(data);
}

export async function checkDiskon(nama_diskon: string): Promise<Diskon> {
  const data = await apiFetch<Record<string, any>>("/api/diskon/check", {
    method: "POST",
    body: { nama_diskon },
  });
  return normalizeDiskon(data?.diskon ?? data);
}

/* ================================================================== */
/* RESERVASI (member)                                                 */
/* ================================================================== */

export type CreateReservasiPayload = {
  id_space: number;
  tanggal_reservasi: string;
  jam_mulai: string;
  durasi_jam: number;
  id_diskon?: number;
  kode_promo?: string;
};

export async function createReservasi(
  payload: CreateReservasiPayload
): Promise<Reservasi> {
  const data = await apiFetch<Record<string, any>>("/api/reservasi", {
    method: "POST",
    auth: true,
    body: payload,
  });
  return normalizeReservasi(data?.reservasi ?? data);
}

export async function getMyReservasi(): Promise<Reservasi[]> {
  const data = await apiFetch<unknown>("/api/reservasi/my", { auth: true });
  return toArray(data).map(normalizeReservasi);
}

export async function getMyHistory(params: {
  month: number | string;
  year: number | string;
}): Promise<Reservasi[]> {
  const data = await apiFetch<unknown>("/api/reservasi/my/history", {
    auth: true,
    query: params,
  });
  return toArray(data).map(normalizeReservasi);
}

export async function getReservasi(id: string | number): Promise<Reservasi> {
  const data = await apiFetch<Record<string, any>>(`/api/reservasi/${id}`, {
    auth: true,
  });
  return normalizeReservasi(data);
}

export type ETicket = {
  reservasi: Reservasi;
  qrValue: string;
  raw: Record<string, any>;
};

export async function getETicket(id: string | number): Promise<ETicket> {
  const data = await apiFetch<Record<string, any>>(
    `/api/reservasi/${id}/e-ticket`,
    { auth: true }
  );

  const reservasi = normalizeReservasi(data?.reservasi ?? data);

  return {
    reservasi,
    qrValue:
      data?.qr_code ??
      data?.qrcode ??
      data?.kode_tiket ??
      reservasi.kode ??
      String(reservasi.id),
    raw: data ?? {},
  };
}

export function cancelReservasi(id: string | number) {
  return apiFetch<Record<string, any>>(`/api/reservasi/${id}/cancel`, {
    method: "PATCH",
    auth: true,
  });
}

/* ================================================================== */
/* ADMIN - PROFILE                                                    */
/* ================================================================== */

export async function getAdminProfile(): Promise<Record<string, any>> {
  return apiFetch<Record<string, any>>("/api/admin/profile", { auth: true });
}

export function updateAdminProfile(payload: {
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
}) {
  return apiFetch<Record<string, any>>("/api/admin/profile", {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

/* ================================================================== */
/* ADMIN - MEMBERS                                                    */
/* ================================================================== */

export async function getMembers(search?: string): Promise<Member[]> {
  const data = await apiFetch<unknown>("/api/admin/members", {
    auth: true,
    query: { search },
  });
  return toArray(data).map(normalizeMember);
}

export async function getMember(id: string | number): Promise<Member> {
  const data = await apiFetch<Record<string, any>>(`/api/admin/members/${id}`, {
    auth: true,
  });
  return normalizeMember(data);
}

export function createMember(payload: RegisterMemberPayload) {
  return apiFetch<Record<string, any>>("/api/admin/members", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateMember(
  id: string | number,
  payload: Partial<RegisterMemberPayload>
) {
  return apiFetch<Record<string, any>>(`/api/admin/members/${id}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteMember(id: string | number) {
  return apiFetch<Record<string, any>>(`/api/admin/members/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

/* ================================================================== */
/* ADMIN - SPACES                                                     */
/* ================================================================== */

export type SpacePayload = {
  nama_space: string;
  tipe_space: string;
  deskripsi: string;
  harga_per_jam: number;
  kapasitas?: number;
  fasilitas?: string;
  foto?: string;
};

export async function getAdminSpaces(): Promise<Space[]> {
  const data = await apiFetch<unknown>("/api/admin/spaces", { auth: true });
  return toArray(data).map(normalizeSpace);
}

export function createSpace(payload: SpacePayload) {
  return apiFetch<Record<string, any>>("/api/admin/spaces", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateSpace(
  id: string | number,
  payload: Partial<SpacePayload>
) {
  return apiFetch<Record<string, any>>(`/api/admin/spaces/${id}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteSpace(id: string | number) {
  return apiFetch<Record<string, any>>(`/api/admin/spaces/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

/* ================================================================== */
/* ADMIN - DISKON                                                     */
/* ================================================================== */

export type DiskonPayload = {
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
};

export async function getAdminDiskon(): Promise<Diskon[]> {
  const data = await apiFetch<unknown>("/api/admin/diskon", { auth: true });
  return toArray(data).map(normalizeDiskon);
}

export function createDiskon(payload: DiskonPayload) {
  return apiFetch<Record<string, any>>("/api/admin/diskon", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateDiskon(
  id: string | number,
  payload: Partial<DiskonPayload>
) {
  return apiFetch<Record<string, any>>(`/api/admin/diskon/${id}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteDiskon(id: string | number) {
  return apiFetch<Record<string, any>>(`/api/admin/diskon/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

/* ================================================================== */
/* ADMIN - RESERVASI & LAPORAN                                        */
/* ================================================================== */

export async function getAdminReservasi(params?: {
  month?: number | string;
  year?: number | string;
  status?: string;
  id_space?: number | string;
  tanggal?: string;
}): Promise<Reservasi[]> {
  const data = await apiFetch<unknown>("/api/admin/reservasi", {
    auth: true,
    query: params,
  });
  return toArray(data).map(normalizeReservasi);
}

export function updateStatusReservasi(id: string | number, status: string) {
  return apiFetch<Record<string, any>>(`/api/admin/reservasi/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: { status },
  });
}

export function checkIn(id: string | number) {
  return apiFetch<Record<string, any>>(`/api/admin/reservasi/${id}/check-in`, {
    method: "POST",
    auth: true,
  });
}

export function checkOut(id: string | number) {
  return apiFetch<Record<string, any>>(`/api/admin/reservasi/${id}/check-out`, {
    method: "POST",
    auth: true,
  });
}

export function getMonthlyReport(params: {
  month: number | string;
  year: number | string;
}) {
  return apiFetch<Record<string, any>>("/api/admin/reports/monthly", {
    auth: true,
    query: params,
  });
}

export function getIncomeReport(params: {
  month: number | string;
  year: number | string;
}) {
  return apiFetch<Record<string, any>>("/api/admin/reports/income", {
    auth: true,
    query: params,
  });
}

/* ================================================================== */
/* UPLOAD                                                             */
/* ================================================================== */

async function upload(path: string, file: File, field = "file") {
  const formData = new FormData();
  formData.append(field, file);

  return apiFetch<Record<string, any>>(path, {
    method: "POST",
    auth: true,
    formData,
  });
}

/** Mengembalikan nama file / URL hasil upload. */
function readUploadResult(data: Record<string, any>): string {
  return (
    data?.filename ?? data?.file ?? data?.path ?? data?.url ?? data?.foto ?? ""
  );
}

export async function uploadImage(file: File) {
  return readUploadResult(await upload("/api/upload/image", file));
}

export async function uploadSpaceImage(file: File) {
  return readUploadResult(await upload("/api/upload/spaces", file));
}

export async function uploadMemberImage(file: File) {
  return readUploadResult(await upload("/api/upload/members", file));
}
