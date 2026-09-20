/**
 * Definisi tipe eksplisit untuk seluruh kontrak API Coworking Space (UKK Paket B).
 * Dilarang menggunakan tipe `any` di sini.
 */

/* ------------------------------------------------------------------ */
/* Generic Response                                                   */
/* ------------------------------------------------------------------ */

export interface ApiResponseSuccess<T> {
  status: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface ApiResponseError {
  status: false;
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

/* ------------------------------------------------------------------ */
/* Auth & User Types                                                  */
/* ------------------------------------------------------------------ */

export type UserRole = "member" | "admin_space" | "admin";

export interface MemberProfile {
  id_member?: number;
  id?: number;
  username: string;
  nama_member: string;
  instansi?: string;
  alamat?: string;
  telp?: string;
  foto?: string;
}

export interface AdminSpaceProfile {
  id_admin?: number;
  id?: number;
  username: string;
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
  alamat?: string;
  deskripsi_fasilitas?: string;
}

export interface UserSession {
  id: number | string | null;
  username: string;
  role: UserRole;
  nama: string;
  telp?: string;
  foto?: string;
  accessToken: string;
  raw?: Record<string, unknown>;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponseData {
  role: UserRole;
  access_token?: string;
  accessToken?: string;
  token?: string;
  member?: MemberProfile;
  space_owner?: AdminSpaceProfile;
  admin?: AdminSpaceProfile;
  user?: MemberProfile | AdminSpaceProfile;
}

export interface RegisterMemberPayload {
  username: string;
  password: string;
  nama_member: string;
  instansi?: string;
  alamat?: string;
  telp?: string;
  foto?: string;
}

export interface RegisterAdminPayload {
  username: string;
  password: string;
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
}

/* ------------------------------------------------------------------ */
/* Space Types                                                        */
/* ------------------------------------------------------------------ */

export interface SpaceItem {
  id: number;
  id_space?: number;
  nama: string;
  nama_space?: string;
  tipe: string;
  tipe_space?: string;
  deskripsi: string;
  hargaPerJam: number;
  harga_per_jam?: number;
  kapasitas: number | null;
  fasilitas: string[];
  gambar: string;
  foto?: string;
  raw?: Record<string, unknown>;
}

export interface SpaceQueryParams {
  tipe?: string;
  search?: string;
}

export interface SpaceAvailabilityParams {
  id_space: number | string;
  tanggal: string;
  jam_mulai: string;
  durasi_jam: number | string;
}

export interface SpaceAvailabilityResult {
  tersedia: boolean;
  pesan: string;
  available?: boolean;
  message?: string;
}

export interface SpaceCreatePayload {
  nama_space: string;
  tipe_space: string;
  deskripsi: string;
  harga_per_jam: number;
  kapasitas?: number;
  fasilitas?: string;
  foto?: string;
}

export type SpaceUpdatePayload = Partial<SpaceCreatePayload>;

/* ------------------------------------------------------------------ */
/* Diskon / Promo Types                                               */
/* ------------------------------------------------------------------ */

export interface DiskonItem {
  id: number;
  id_diskon?: number;
  nama: string;
  nama_diskon?: string;
  persentase: number;
  persentase_diskon?: number;
  tanggalMulai: string;
  tanggal_mulai?: string;
  tanggalBerakhir: string;
  tanggal_berakhir?: string;
  raw?: Record<string, unknown>;
}

export interface DiskonCheckPayload {
  nama_diskon: string;
}

export interface DiskonCreatePayload {
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
}

export type DiskonUpdatePayload = Partial<DiskonCreatePayload>;

/* ------------------------------------------------------------------ */
/* Reservasi Types                                                    */
/* ------------------------------------------------------------------ */

export type StatusReservasi =
  | "menunggu"
  | "disetujui"
  | "ditolak"
  | "dibatalkan"
  | "aktif"
  | "selesai"
  | string;

export interface CreateReservasiPayload {
  id_space: number;
  tanggal_reservasi: string;
  jam_mulai: string;
  durasi_jam: number;
  id_diskon?: number;
  kode_promo?: string;
}

export interface ReservasiItem {
  id: number;
  id_reservasi?: number;
  kode: string;
  kode_reservasi?: string;
  idSpace: number | null;
  id_space?: number | null;
  namaSpace: string;
  nama_space?: string;
  namaMember: string;
  nama_member?: string;
  tanggal: string;
  tanggal_reservasi?: string;
  jamMulai: string;
  jam_mulai?: string;
  jamSelesai: string;
  jam_selesai?: string;
  durasiJam: number;
  durasi_jam?: number;
  total: number;
  total_bayar?: number;
  status: StatusReservasi;
  checkIn: string | null;
  waktu_check_in?: string | null;
  checkOut: string | null;
  waktu_check_out?: string | null;
  raw?: Record<string, unknown>;
}

export interface ETicketData {
  reservasi: ReservasiItem;
  qrValue: string;
  qr_code_payload?: string;
  kode_booking?: string;
  tarif_kotor?: number;
  potongan_diskon?: number;
  total_dibayar?: number;
}

/* ------------------------------------------------------------------ */
/* Admin Reports Types                                                */
/* ------------------------------------------------------------------ */

export interface DailyIncomeItem {
  tanggal: string;
  hari?: string;
  total_pendapatan: number;
  jumlah_reservasi?: number;
}

export interface SpaceIncomeBreakdownItem {
  tipe_space: string;
  nama_space?: string;
  total_pendapatan: number;
  jumlah_reservasi: number;
}

export interface MonthlyReportData {
  bulan: number;
  tahun: number;
  total_reservasi: number;
  total_selesai: number;
  total_dibatalkan?: number;
  total_menunggu?: number;
  reservasi_per_space?: SpaceIncomeBreakdownItem[];
  items?: ReservasiItem[];
}

export interface IncomeReportData {
  bulan: number;
  tahun: number;
  total_pendapatan: number;
  rata_rata_harian?: number;
  harian?: DailyIncomeItem[];
  breakdown_tipe?: SpaceIncomeBreakdownItem[];
}

/* ------------------------------------------------------------------ */
/* Upload Response                                                    */
/* ------------------------------------------------------------------ */

export interface UploadResponseData {
  filename: string;
  url?: string;
  path?: string;
}
