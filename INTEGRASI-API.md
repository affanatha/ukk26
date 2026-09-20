# Integrasi ke API Coworking Space

Base URL: `https://learn.smktelkom-mlg.sch.id/coworking`

## 1. Konfigurasi

```bash
cp .env.local.example .env.local
```

Isi `NEXT_PUBLIC_APP_KEY` dengan app key milikmu. Cara mendapatkannya:

1. `POST /api/maker/register` (name, username, email, password), atau
2. `POST /api/maker/login` (usernameOrEmail, password)

Response-nya memuat app key berformat `mk_xxxxxxxxxxxx`. Key ini dikirim di header
`x-maker-key` pada setiap request. Tanpa key ini semua endpoint akan menolak.

Lalu jalankan:

```bash
npm install
npm run dev
```

## 2. Struktur kode

| File | Isi |
| --- | --- |
| `lib/api/client.ts` | `apiFetch()` — pemasang header `x-maker-key` + `Authorization`, parsing error, penyimpanan token |
| `lib/api/types.ts` | Tipe domain + normalizer (menyeragamkan nama field dari server) |
| `lib/api/services.ts` | Satu fungsi per endpoint, seluruh 50 endpoint di koleksi Postman |
| `lib/auth-context.tsx` | `AuthProvider`, `useAuth()`, `useRequireAuth(roles)` |

Token JWT disimpan di `localStorage` (`coworking_token`) dan otomatis dihapus saat
server membalas 401.

## 3. Halaman yang sudah tersambung

**Publik**
- `/` — daftar ruangan, filter tipe dan pencarian (`GET /api/spaces`, `/api/spaces/types`)
- `/auth/Login` — `POST /api/auth/login`
- `/auth/Register` — register member atau admin space

**Member**
- `/member` — reservasi aktif + pembatalan (`/api/reservasi/my`, `PATCH .../cancel`)
- `/member/spaces`, `/member/[id]` — daftar dan detail ruangan
- `/member/reservation` — cek ketersediaan, cek kode promo, buat reservasi
- `/member/history` — riwayat per bulan
- `/member/ticket/[id]` — e-ticket + QR

**Admin space** (semua di bawah `/admin`, dikunci role `admin_space`)
- ringkasan, reservasi (setujui/tolak/check-in/check-out), ruangan, member, diskon, laporan, profil

## 4. Yang perlu kamu cek saat API sudah bisa diakses

Koleksi Postman tidak menyertakan contoh response, jadi beberapa hal ditebak
secara defensif dan mungkin perlu disesuaikan:

1. **Pembungkus response.** `apiFetch` otomatis membuka field `data` bila ada.
   Kalau server memakai nama lain (`result`, `payload`), ubah fungsi `unwrap()`
   di `lib/api/client.ts`.
2. **Nama field.** Normalizer di `lib/api/types.ts` menerima beberapa kemungkinan
   nama (`id_space`/`id`, `harga_per_jam`/`harga`, dst). Setelah tahu bentuk
   aslinya, sisakan yang benar saja.
3. **URL gambar.** `resolveImageUrl()` menyusun `${BASE}/uploads/spaces/<namafile>`.
   Sesuaikan kalau folder di server berbeda.
4. **Field upload.** `POST /api/upload/*` dikirim sebagai multipart dengan nama
   field `file`. Kalau server memakai `image` atau `foto`, ubah di fungsi
   `upload()` pada `lib/api/services.ts`.
5. **Body admin create/update space & diskon** tidak ada di koleksi Postman.
   Tipe `SpacePayload` dan `DiskonPayload` disusun dari pola endpoint lain —
   cocokkan dengan dokumen kontrak API.
6. **Nilai status reservasi** diasumsikan `menunggu`, `disetujui`, `ditolak`,
   `dibatalkan`, `selesai` (mengikuti contoh `{"status": "disetujui"}`).

## 5. Kalau halaman berhenti di "Memuat…"

Penyebab paling umum: browser memanggil `https://learn.smktelkom-mlg.sch.id`
langsung. Header `x-maker-key` memicu preflight CORS, dan kalau server tidak
menjawabnya, request menggantung tanpa error — persis seperti gejala "Memuat…"
yang tidak selesai dan tombol login yang diam.

Karena itu semua request sekarang lewat proxy same-origin:

- `next.config.ts` meneruskan `/backend/*` ke `${API_ORIGIN}/*`
- `API_BASE_URL` di `lib/api/client.ts` bernilai `/backend`

Jadi dari sisi browser tidak ada lintas domain sama sekali.

Langkah pengecekan:

1. Jalankan ulang `npm run dev` setiap kali `.env.local` atau `next.config.ts`
   berubah — Next.js hanya membaca keduanya saat start.
2. Buka `/diagnostik`, tekan "Jalankan uji koneksi". Halaman itu menampilkan
   status HTTP dan balasan mentah dari `/health`, `/api/spaces`, dan
   `/api/spaces/types`.
3. Kalau muncul 401 atau 403, berarti `NEXT_PUBLIC_APP_KEY` salah atau kosong.
4. Kalau muncul 200 tapi daftar ruangan tetap kosong, lihat bentuk JSON-nya di
   halaman diagnostik lalu sesuaikan `toArray()` dan `normalizeSpace()` di
   `lib/api/types.ts`.

Setiap request juga punya batas waktu 20 detik, jadi UI tidak akan menggantung
tanpa batas lagi.
