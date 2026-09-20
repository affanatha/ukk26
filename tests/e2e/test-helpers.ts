import { Page } from "@playwright/test";

export async function setupApiMocks(page: Page) {
  // Mock Space Types
  await page.route("**/api/spaces/types", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: ["Personal Desk", "Meeting Room", "Private Office", "Event Space"],
      }),
    });
  });

  // Mock Spaces List
  await page.route(/\/api\/spaces(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get("search") || "";
    const tipe = url.searchParams.get("tipe") || "";

    const allSpaces = [
      {
        id: 1,
        id_space: 1,
        nama: "Desk Alpha",
        nama_space: "Desk Alpha",
        tipe: "Personal Desk",
        tipe_space: "Personal Desk",
        deskripsi: "Meja personal ergonomis",
        harga_per_jam: 15000,
        hargaPerJam: 15000,
        kapasitas: 1,
        fasilitas: ["WiFi", "Stop Kontak", "Air Mineral"],
        foto: "desk-alpha.jpg",
      },
      {
        id: 2,
        id_space: 2,
        nama: "Meeting Room Beta",
        nama_space: "Meeting Room Beta",
        tipe: "Meeting Room",
        tipe_space: "Meeting Room",
        deskripsi: "Ruang meeting kedap suara",
        harga_per_jam: 75000,
        hargaPerJam: 75000,
        kapasitas: 6,
        fasilitas: ["Smart TV", "Whiteboard", "WiFi"],
        foto: "meeting-beta.jpg",
      },
    ];

    let filtered = allSpaces;
    if (tipe) {
      filtered = filtered.filter((s) => s.tipe === tipe);
    }
    if (search) {
      filtered = filtered.filter((s) =>
        s.nama.toLowerCase().includes(search.toLowerCase())
      );
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true, data: filtered }),
    });
  });

  // Mock Single Space
  await page.route("**/api/spaces/1", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: {
          id: 1,
          id_space: 1,
          nama: "Desk Alpha",
          nama_space: "Desk Alpha",
          tipe: "Personal Desk",
          tipe_space: "Personal Desk",
          deskripsi: "Meja personal ergonomis",
          harga_per_jam: 15000,
          hargaPerJam: 15000,
          kapasitas: 1,
          fasilitas: ["WiFi", "Stop Kontak", "Air Mineral"],
          foto: "desk-alpha.jpg",
        },
      }),
    });
  });

  // Mock Availability
  await page.route("**/api/spaces/availability?*", async (route) => {
    const url = new URL(route.request().url());
    const jamMulai = url.searchParams.get("jam_mulai") || "";

    if (jamMulai === "00:00") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: { tersedia: false, message: "Jadwal penuh / bentrok." },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: { tersedia: true, message: "Jadwal tersedia untuk dipesan." },
        }),
      });
    }
  });

  // Mock Active Discounts
  await page.route("**/api/diskon/active", async (route) => {
    await route.fulfill({
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
    });
  });

  // Mock Check Discount
  await page.route("**/api/diskon/check", async (route) => {
    const postData = route.request().postDataJSON();
    if (postData?.nama_diskon === "DISKON20" || postData?.nama_diskon === "HEMAT50") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            id: 10,
            nama_diskon: postData.nama_diskon,
            persentase_diskon: 20,
            tanggal_mulai: "2026-01-01",
            tanggal_berakhir: "2026-12-31",
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          status: false,
          message: "Kode promo tidak valid atau telah berakhir.",
        }),
      });
    }
  });

  // Mock Reservasi Create & List
  await page.route("**/api/reservasi", async (route) => {
    if (route.request().method() === "POST") {
      const data = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          message: "Reservasi berhasil dibuat",
          data: {
            id: 101,
            id_reservasi: 101,
            kode_reservasi: "BOOK-101",
            id_space: data.id_space,
            nama_space: "Desk Alpha",
            nama_member: "Uji Member",
            tanggal_reservasi: data.tanggal_reservasi,
            jam_mulai: data.jam_mulai,
            durasi_jam: data.durasi_jam,
            total_bayar: 30000,
            status: "menunggu",
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/reservasi/my", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: [
          {
            id: 101,
            id_reservasi: 101,
            kode: "BOOK-101",
            id_space: 1,
            nama_space: "Desk Alpha",
            nama_member: "Uji Member",
            tanggal: "2026-09-20",
            jam_mulai: "09:00",
            jam_selesai: "11:00",
            durasi_jam: 2,
            total_bayar: 30000,
            status: "menunggu",
          },
        ],
      }),
    });
  });

  await page.route("**/api/reservasi/my/history?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: [
          {
            id: 100,
            id_reservasi: 100,
            kode: "BOOK-100",
            nama_space: "Meeting Room Beta",
            nama_member: "Uji Member",
            tanggal: "2026-09-10",
            jam_mulai: "13:00",
            durasi_jam: 2,
            total_bayar: 150000,
            status: "selesai",
          },
        ],
      }),
    });
  });

  await page.route("**/api/reservasi/*/e-ticket", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: {
          qr_code_payload: "QR_PAYLOAD_VALID_101",
          reservasi: {
            id: 101,
            kode: "BOOK-101",
            nama_space: "Desk Alpha",
            nama_member: "Uji Member",
            tanggal: "2026-09-20",
            jam_mulai: "09:00",
            durasi_jam: 2,
            total_bayar: 30000,
            status: "menunggu",
          },
        },
      }),
    });
  });

  await page.route("**/api/reservasi/*/cancel", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        message: "Reservasi berhasil dibatalkan",
      }),
    });
  });
}
