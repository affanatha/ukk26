import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerMemberSchema = z
  .object({
    username: z.string().min(3, "Username minimal 3 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
    nama_member: z.string().min(1, "Nama lengkap wajib diisi"),
    instansi: z.string().optional(),
    alamat: z.string().min(1, "Alamat wajib diisi"),
    telp: z.string().min(8, "Nomor telepon minimal 8 digit"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type RegisterMemberFormValues = z.infer<typeof registerMemberSchema>;

export const registerAdminSchema = z
  .object({
    username: z.string().min(3, "Username minimal 3 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
    nama_coworking: z.string().min(1, "Nama coworking space wajib diisi"),
    nama_pemilik: z.string().min(1, "Nama pemilik wajib diisi"),
    telp: z.string().min(8, "Nomor telepon minimal 8 digit"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type RegisterAdminFormValues = z.infer<typeof registerAdminSchema>;

export const reservasiSchema = z.object({
  id_space: z.number().min(1, "Ruangan wajib dipilih"),
  tanggal_reservasi: z.string().min(1, "Tanggal reservasi wajib dipilih"),
  jam_mulai: z.string().min(1, "Jam mulai wajib dipilih"),
  durasi_jam: z.number().min(1, "Durasi minimal 1 jam").max(12, "Durasi maksimal 12 jam"),
  id_diskon: z.number().optional(),
  kode_promo: z.string().optional(),
});

export type ReservasiFormValues = z.infer<typeof reservasiSchema>;

export const spaceSchema = z.object({
  nama_space: z.string().min(1, "Nama ruangan wajib diisi"),
  tipe_space: z.string().min(1, "Tipe ruangan wajib diisi"),
  deskripsi: z.string().min(1, "Deskripsi ruangan wajib diisi"),
  harga_per_jam: z.coerce.number().min(1000, "Harga minimal Rp 1.000 per jam"),
  kapasitas: z.coerce.number().min(1, "Kapasitas minimal 1 orang").optional(),
  fasilitas: z.string().optional(),
});

export type SpaceFormValues = z.infer<typeof spaceSchema>;

export const diskonSchema = z
  .object({
    nama_diskon: z.string().min(1, "Nama / kode diskon wajib diisi"),
    persentase_diskon: z.coerce
      .number()
      .min(1, "Diskon minimal 1%")
      .max(100, "Diskon maksimal 100%"),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    tanggal_berakhir: z.string().min(1, "Tanggal berakhir wajib diisi"),
  })
  .refine((data) => new Date(data.tanggal_berakhir) >= new Date(data.tanggal_mulai), {
    message: "Tanggal berakhir tidak boleh sebelum tanggal mulai",
    path: ["tanggal_berakhir"],
  });

export type DiskonFormValues = z.infer<typeof diskonSchema>;

export const adminProfileSchema = z.object({
  nama_coworking: z.string().min(1, "Nama coworking wajib diisi"),
  nama_pemilik: z.string().min(1, "Nama pemilik wajib diisi"),
  telp: z.string().min(8, "Nomor telepon minimal 8 digit"),
  alamat: z.string().optional(),
  deskripsi_fasilitas: z.string().optional(),
});

export type AdminProfileFormValues = z.infer<typeof adminProfileSchema>;
