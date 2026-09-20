import { chromium } from "@playwright/test";

async function main() {
  console.log("🚀 Membuka Chromium headed untuk demonstrasi interaktif...");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Kecepatan diperlambat agar alur dapat dilihat jelas
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  // Mock API agar data tetap ada dan tidak dihapus
  const spaces = [
    {
      id: 1,
      id_space: 1,
      nama: "Desk Alpha",
      nama_space: "Desk Alpha",
      tipe: "Personal Desk",
      tipe_space: "Personal Desk",
      deskripsi: "Meja personal ergonomis dengan kursi mesh dan stop kontak dedikasi.",
      harga_per_jam: 15000,
      hargaPerJam: 15000,
      kapasitas: 1,
      fasilitas: ["WiFi 100Mbps", "Stop Kontak", "Air Mineral Bebas Isi Ulang"],
      foto: "desk-alpha.jpg",
    },
    {
      id: 2,
      id_space: 2,
      nama: "Meeting Room Beta",
      nama_space: "Meeting Room Beta",
      tipe: "Meeting Room",
      tipe_space: "Meeting Room",
      deskripsi: "Ruang rapat kedap suara dilengkapi Smart TV 55 inch dan Whiteboard magnetik.",
      harga_per_jam: 75000,
      hargaPerJam: 75000,
      kapasitas: 6,
      fasilitas: ["Smart TV 4K", "Whiteboard", "High-Speed WiFi", "Proyektor"],
      foto: "meeting-beta.jpg",
    },
    {
      id: 3,
      id_space: 3,
      nama: "Private Office Gamma",
      nama_space: "Private Office Gamma",
      tipe: "Private Office",
      tipe_space: "Private Office",
      deskripsi: "Ruang kantor privat ber-AC untuk tim startup dengan akses kunci digital.",
      harga_per_jam: 120000,
      hargaPerJam: 120000,
      kapasitas: 4,
      fasilitas: ["Kunci Pintar", "AC Pribadi", "Loker Dokumen", "Coffee Maker"],
      foto: "office-gamma.jpg",
    },
  ];

  let reservations = [
    {
      id: 101,
      id_reservasi: 101,
      kode: "BOOK-101",
      kode_reservasi: "BOOK-101",
      id_space: 1,
      nama_space: "Desk Alpha",
      nama_member: "Uji Member (Aktif)",
      tanggal: "2026-09-25",
      jam_mulai: "10:00",
      jam_selesai: "12:00",
      durasi_jam: 2,
      total_bayar: 24000,
      total: 24000,
      status: "menunggu",
    },
    {
      id: 102,
      id_reservasi: 102,
      kode: "BOOK-102",
      kode_reservasi: "BOOK-102",
      id_space: 2,
      nama_space: "Meeting Room Beta",
      nama_member: "Uji Member (Aktif)",
      tanggal: "2026-09-26",
      jam_mulai: "13:00",
      jam_selesai: "15:00",
      durasi_jam: 2,
      total_bayar: 150000,
      total: 150000,
      status: "disetujui",
    },
  ];

  let members = [
    {
      id: 1,
      nama: "Dewi Lestari",
      username: "dewi_l",
      instansi: "Startup Studio",
      alamat: "Jl. Soekarno Hatta No. 12",
      telp: "0811223344",
    },
    {
      id: 2,
      nama: "Rudi Hartono",
      username: "rudi_baru",
      instansi: "Tech Corp Indonesia",
      alamat: "Jl. Ijen Boulevard No. 45",
      telp: "081999888777",
    },
  ];

  // Intercept routes
  await page.route("**/api/spaces/types", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: ["Personal Desk", "Meeting Room", "Private Office"],
      }),
    })
  );

  await page.route(/\/api\/spaces(\?.*)?$/, (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true, data: spaces }),
    })
  );

  await page.route("**/api/spaces/1", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true, data: spaces[0] }),
    })
  );

  await page.route("**/api/spaces/availability?*", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: { tersedia: true, message: "Jadwal tersedia untuk dipesan." },
      }),
    })
  );

  await page.route("**/api/diskon/active", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: [
          {
            id: 10,
            nama_diskon: "DISKON20",
            persentase_diskon: 20,
            tanggal_mulai: "2026-01-01",
            tanggal_berakhir: "2026-12-31",
          },
        ],
      }),
    })
  );

  await page.route("**/api/auth/profile", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: {
          id: 1,
          role: "member",
          username: "member_demo",
          nama: "Nabil Kencana (Member)",
        },
      }),
    })
  );

  await page.route("**/api/reservasi/my", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true, data: reservations }),
    })
  );

  await page.route("**/api/reservasi/my/history?*", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true, data: reservations }),
    })
  );

  await page.route("**/api/reservasi/*/e-ticket", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: {
          qr_code_payload: "TICKET-UKK26-NABIL-101",
          reservasi: reservations[0],
        },
      }),
    })
  );

  await page.route("**/api/reservasi", async (r) => {
    if (r.request().method() === "POST") {
      const b = r.request().postDataJSON();
      const newRes = {
        id: 103,
        id_reservasi: 103,
        kode: "BOOK-103",
        kode_reservasi: "BOOK-103",
        id_space: b.id_space || 1,
        nama_space: "Desk Alpha",
        nama_member: "Nabil Kencana (Member)",
        tanggal: b.tanggal_reservasi || "2026-09-28",
        jam_mulai: b.jam_mulai || "09:00",
        jam_selesai: "11:00",
        durasi_jam: b.durasi_jam || 2,
        total_bayar: 24000,
        total: 24000,
        status: "menunggu",
      };
      reservations.unshift(newRes);
      await r.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          message: "Reservasi berhasil dibuat",
          data: newRes,
        }),
      });
    } else {
      await r.continue();
    }
  });

  await page.route("**/api/admin/members", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true, data: members }),
    })
  );

  // Pasang sesi login member
  await page.addInitScript(() => {
    window.localStorage.setItem("coworking_token", "demo-jwt-token-active");
    window.localStorage.setItem(
      "coworking_user",
      JSON.stringify({
        id: 1,
        role: "member",
        username: "member_demo",
        nama: "Nabil Kencana (Member)",
      })
    );
  });

  // 1. Kunjungi Beranda Katalog Space
  console.log("📍 [1/4] Membuka Katalog Ruangan (Layar A.1 & A.2)...");
  await page.goto("http://localhost:3000/");
  await page.waitForTimeout(1500);

  // Filter tipe Meeting Room
  const tabMeeting = page.locator("#tab-tipe-filter button", {
    hasText: "Meeting Room",
  });
  if (await tabMeeting.isVisible()) {
    await tabMeeting.click();
    await page.waitForTimeout(1000);
  }

  // Filter kembali Semua
  const tabSemua = page.locator("#tab-tipe-filter button", {
    hasText: "Semua",
  });
  if (await tabSemua.isVisible()) {
    await tabSemua.click();
    await page.waitForTimeout(1000);
  }

  // 2. Kunjungi Detail Space & Form Reservasi
  console.log("📍 [2/4] Membuka Form Reservasi & Kalkulasi Promo (Layar A.4)...");
  await page.goto("http://localhost:3000/member/reservation?spaceId=1");
  await page.waitForTimeout(1500);

  await page.fill("#input-tanggal", "2026-09-28");
  await page.fill("#input-jam-mulai", "09:00");
  await page.selectOption("#select-durasi", "2");
  await page.waitForTimeout(1000);

  // Terapkan promo DISKON20
  await page.selectOption("#select-active-diskon", "10");
  await page.waitForTimeout(1500);

  // Buat reservasi baru (data tidak akan dihapus)
  console.log("📝 Membuat reservasi baru...");
  await page.click("#btn-submit-reservasi");
  await page.waitForTimeout(2000);

  // 3. Halaman Status Pemesanan
  console.log("📍 [3/4] Membuka Status Pemesanan Member (Layar A.5)... Data disimpan dan tidak dihapus!");
  await page.goto("http://localhost:3000/member");
  await page.waitForTimeout(2500);

  // 4. Lihat E-Ticket Resmi
  console.log("📍 [4/4] Membuka E-Ticket Resmi dengan QR Code (Layar A.7)...");
  await page.goto("http://localhost:3000/member/ticket/101");
  await page.waitForTimeout(2500);

  console.log("✅ Alur selesai! Chromium dibiarkan terbuka agar Anda dapat melihat dan mencoba aplikasinya langsung.");
  console.log("⏳ Menjaga browser tetap aktif selama 120 detik (atau tutup jendela kapan saja)...");
  await page.waitForTimeout(120000);

  await browser.close();
}

main().catch(console.error);
