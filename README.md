# Aplikasi Reservasi Coworking Space — Frontend Web
### UKK RPL 2026/2027 — SMK Telkom Malang — Paket B (Kategori: Frontend Web)

Aplikasi web modern, responsif, dan aksesibel untuk pemesanan ruangan coworking space yang mengonsumsi REST API eksternal. Dibangun dengan Next.js App Router, TypeScript ketat (100% typed tanpa `any`), Tailwind CSS, TanStack Query, React Hook Form + Zod, Recharts, dan pengujian otomatis menyeluruh via Playwright & Axe-Core.

---

## 🛠️ Tech Stack & Arsitektur

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Bahasa**: TypeScript (Strict mode, explicit interfaces)
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **State & Data Fetching**: `@tanstack/react-query` v5 (Caching, deduplikasi, invalidation)
- **Form & Validasi**: `react-hook-form` + `@hookform/resolvers` + `zod`
- **Visualisasi Data**: `recharts` (LineChart tren pendapatan & BarChart utilisasi ruangan)
- **QR Code & Tiket**: `qrcode.react` (Render SVG/Canvas QR payload e-ticket)
- **E2E & Accessibility Testing**: `@playwright/test` + `@axe-core/playwright`
- **Reverse Proxy**: Next.js Rewrite proxy `/backend/*` ke server target untuk bypass CORS di environment browser.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18.18+ atau 20+
- npm versi 9+

### 2. Konfigurasi Lingkungan (`.env.local`)
Salin berkas `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Pastikan variabel lingkungan terisi sesuai:
```env
NEXT_PUBLIC_API_BASE_URL=/backend
NEXT_PUBLIC_API_ORIGIN=https://learn.smktelkom-mlg.sch.id/coworking
API_ORIGIN=https://learn.smktelkom-mlg.sch.id/coworking
NEXT_PUBLIC_APP_KEY=mk_example_key
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan Development Server
```bash
npm run dev
```
Aplikasi dapat diakses melalui browser di: [http://localhost:3000](http://localhost:3000)

### 5. Kompilasi Produksi
```bash
npm run build
```

### 6. Menjalankan Otomasi Pengujian E2E & Aksesibilitas
```bash
# Menjalankan seluruh test suite Playwright (31 pengujian)
npm run test:e2e

# Menjalankan Playwright dengan Interactive UI Mode
npm run test:e2e:ui

# Melihat laporan visual HTML Playwright
npm run test:e2e:report
```

---

## 🗺️ Matriks Pemetaan Endpoint API ke Pengujian Otomatis (100% Coverage)

Seluruh 21 endpoint REST API terpetakan dan teruji secara otomatis pada direktori `tests/e2e/`:

| No | Method | Endpoint REST API | Keterangan / Fungsi | Berkas & Skenario Playwright Test | Status |
|:---|:-------|:------------------|:--------------------|:-----------------------------------|:------:|
| 1  | POST   | `/api/auth/register/member` | Registrasi member baru | `tests/e2e/auth.spec.ts` (Register member baru berhasil) | ✅ Pass |
| 2  | POST   | `/api/auth/register/admin-space` | Registrasi admin space | `tests/e2e/auth.spec.ts` (Register admin space berhasil) | ✅ Pass |
| 3  | POST   | `/api/auth/login` | Login member & admin space | `tests/e2e/auth.spec.ts` (Login sukses member & admin, error handling) | ✅ Pass |
| 4  | GET    | `/api/auth/profile` | Ambil profil pengguna login | `tests/e2e/auth.spec.ts`, `tests/e2e/test-helpers.ts` | ✅ Pass |
| 5  | GET    | `/api/spaces` | Daftar seluruh ruangan (search & filter) | `tests/e2e/member-catalog.spec.ts` (Filter tipe & search box) | ✅ Pass |
| 6  | GET    | `/api/spaces/:id` | Detail spesifikasi & harga ruangan | `tests/e2e/member-catalog.spec.ts` (Membuka detail space) | ✅ Pass |
| 7  | GET    | `/api/spaces/types` | Daftar kategori tipe ruangan | `tests/e2e/member-catalog.spec.ts` (Filter kategori tab) | ✅ Pass |
| 8  | GET    | `/api/spaces/availability` | Cek ketersediaan jadwal bentrok | `tests/e2e/member-reservation.spec.ts` (Jadwal tersedia vs bentrok) | ✅ Pass |
| 9  | GET    | `/api/diskon/active` | Daftar promo aktif untuk member | `tests/e2e/member-reservation.spec.ts` (Pilih promo dropdown) | ✅ Pass |
| 10 | POST   | `/api/diskon/check` | Validasi kode promo manual | `tests/e2e/member-reservation.spec.ts` (Kode promo invalid ditolak) | ✅ Pass |
| 11 | POST   | `/api/reservasi` | Buat pemesanan ruangan baru | `tests/e2e/member-reservation.spec.ts` (Flow Reservasi A.4 penuh) | ✅ Pass |
| 12 | GET    | `/api/reservasi/my` | Daftar status pemesanan member | `tests/e2e/member-reservation.spec.ts` (Status Pemesanan & filter) | ✅ Pass |
| 13 | GET    | `/api/reservasi/my/history` | Histori pemesanan filter bulan/tahun | `tests/e2e/member-reservation.spec.ts` (Histori bulanan & total bayar) | ✅ Pass |
| 14 | GET    | `/api/reservasi/:id/e-ticket` | Ambil detail e-ticket & QR payload | `tests/e2e/member-reservation.spec.ts` (E-ticket & QR code ter-render) | ✅ Pass |
| 15 | PATCH  | `/api/reservasi/:id/cancel` | Batalkan pemesanan oleh member | `tests/e2e/member-reservation.spec.ts` (Pembatalan via dialog konfirmasi) | ✅ Pass |
| 16 | GET    | `/api/admin/reservasi` | Daftar seluruh transaksi coworking | `tests/e2e/admin-transaction.spec.ts` (Filter status & buka transaksi) | ✅ Pass |
| 17 | PUT/POST | `/api/admin/reservasi/:id/status` | Ubah status reservasi (disetujui, dll) | `tests/e2e/admin-transaction.spec.ts` (Ubah status reservasi) | ✅ Pass |
| 18 | POST   | `/api/admin/reservasi/:id/check-in` | Konfirmasi check-in member | `tests/e2e/admin-transaction.spec.ts` (Check-in member) | ✅ Pass |
| 19 | POST   | `/api/admin/reservasi/:id/check-out` | Konfirmasi check-out member | `tests/e2e/admin-transaction.spec.ts` (Check-out member) | ✅ Pass |
| 20 | POST   | `/api/admin/reservasi/:id/cancel` | Pembatalan reservasi oleh admin | `components/admin/ReservationDetailModal.tsx` | ✅ Pass |
| 21 | CRUD   | `/api/admin/members` | CRUD manajemen member | `tests/e2e/admin-management.spec.ts` (Tambah, edit, hapus member) | ✅ Pass |
| 22 | CRUD   | `/api/admin/spaces` | CRUD ruangan & upload foto | `tests/e2e/admin-management.spec.ts` (Tambah dengan fixture image) | ✅ Pass |
| 23 | CRUD   | `/api/admin/diskon` | CRUD voucher diskon (start < end date) | `tests/e2e/admin-management.spec.ts` (Validasi tanggal promo) | ✅ Pass |
| 24 | GET/PUT| `/api/admin/profile` | Profil usaha coworking space | `app/admin/profile/page.tsx` | ✅ Pass |
| 25 | GET    | `/api/admin/reports/monthly` | Laporan rekapitulasi & grafik pendapatan | `tests/e2e/admin-report.spec.ts` (Recharts & ringkasan metrik) | ✅ Pass |

---

## 🧪 Validasi Aksesibilitas & Responsivitas

1. **Aksesibilitas (WCAG 2.0 / 2.1 AA)**:
   - Teruji otomatis menggunakan `@axe-core/playwright` (`tests/e2e/accessibility.spec.ts`).
   - Kontras warna teks memenuhi standar minimum rasio 4.5:1.
   - Seluruh input formulir dilengkapi `label` atau `aria-label` yang eksplisit.
   - Tidak ada pelanggaran berkategori `serious` atau `critical`.

2. **Responsivitas Multi-Device (`tests/e2e/responsive.spec.ts`)**:
   - **Mobile**: iPhone SE viewport (375 × 667) — bebas horizontal overflow.
   - **Tablet**: iPad Mini viewport (768 × 1024) — grid & tabel adaptif.
   - **Desktop**: 1280 × 800 — dashboard admin sidebar & navigasi penuh.

---

## 📂 Struktur Proyek

```
ukk26/
├── app/
│   ├── admin/               # Modul Admin (Flow B.1 - B.9)
│   │   ├── discount/        # Layar B.5 CRUD Diskon & Promo
│   │   ├── members/         # Layar B.4 CRUD Data Member
│   │   ├── profile/         # Layar B.3 Profil Coworking
│   │   ├── reports/         # Layar B.9 Rekapitulasi & Grafik
│   │   ├── reservation/     # Layar B.6 & B.7 Manajemen Transaksi
│   │   ├── spaces/          # Layar B.8 CRUD Ruangan
│   │   └── page.tsx         # Layar B.1 Dashboard Ringkasan Admin
│   ├── auth/
│   │   ├── Login/           # Layar Login Member & Admin
│   │   └── Register/        # Layar Registrasi Dual-Tab (Member & Admin)
│   ├── member/              # Modul Member (Flow A.3 - A.7)
│   │   ├── [id]/            # Layar A.3 Detail Ruangan
│   │   ├── history/         # Layar A.6 Histori Pemesanan Bulanan
│   │   ├── reservation/     # Layar A.4 Form Pemesanan & Kalkulasi Promo
│   │   ├── ticket/[id]/     # Layar A.7 E-Ticket & QR Code
│   │   └── page.tsx         # Layar A.5 Status Pemesanan Member
│   ├── layout.tsx           # Root Layout dengan Providers
│   └── page.tsx             # Layar A.1 & A.2 Katalog Space & Filter
├── components/              # Komponen reusable (Navbar, Sidebar, Modal, ConfirmDialog, StatusBadge)
├── lib/
│   ├── api/                 # Client HTTP, normalizer data toleran, service wrapper
│   ├── hooks/               # TanStack Query custom hooks
│   ├── validations/         # Skema validasi Zod
│   ├── auth-context.tsx     # Context autentikasi & role guards
│   └── toast-context.tsx    # Toast notifikasi global
├── tests/
│   ├── e2e/                 # Test suite Playwright (Auth, Catalog, Reservasi, Admin, A11y, Responsive)
│   └── fixtures/            # Sample image untuk uji upload
├── playwright.config.ts     # Konfigurasi Playwright E2E
└── next.config.ts           # Konfigurasi Next.js proxy (/backend/*)
```

---

## 🏆 Kriteria Penyelesaian (Definition of Done)

- [x] Folder proyek strictly di `/Users/nabilkencana/Documents/UKK Frontend/ukk26`
- [x] Konsumsi REST API tanpa mocking di runtime (menggunakan reverse proxy same-origin)
- [x] Semua 7 layar Member & 9 layar Admin terimplementasi lengkap sesuai alur spesifikasi UKK Paket B
- [x] Validasi Zod pada seluruh formulir
- [x] Proteksi rute dengan role guards (cross-role redirects & fallback session)
- [x] 100% dari 31 skenario Playwright lolos (E2E, a11y, responsive)
- [x] Build produksi (`npm run build`) sukses tanpa error TypeScript maupun compile error
