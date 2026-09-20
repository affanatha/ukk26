import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Admin Management Suite (CRUD Member, Space, Diskon)", () => {
  test.beforeEach(async ({ page }) => {
    // Set authenticated session sebagai admin
    await page.addInitScript(() => {
      window.localStorage.setItem("coworking_token", "fake-admin-jwt-token");
      window.localStorage.setItem(
        "coworking_user",
        JSON.stringify({
          id: 2,
          role: "admin_space",
          username: "admin_test",
          nama: "Pengelola Coworking",
        })
      );
    });

    await page.route("**/api/auth/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            id: 2,
            role: "admin_space",
            username: "admin_test",
            nama: "Pengelola Coworking",
          },
        }),
      });
    });

    // Mock API upload image
    await page.route("**/api/upload/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          filename: "uploaded-sample.png",
        }),
      });
    });
  });

  test("CRUD Member: Tambah, edit, dan hapus member", async ({ page }) => {
    let members = [
      {
        id: 1,
        nama: "Dewi Lestari",
        username: "dewi_l",
        instansi: "Startup Inc",
        alamat: "Malang",
        telp: "0811223344",
      },
    ];

    await page.route("**/api/admin/members?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: true, data: members }),
      });
    });

    await page.route("**/api/admin/members", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        members.push({
          id: 2,
          nama: body.nama_member,
          username: body.username,
          instansi: body.instansi,
          alamat: body.alamat,
          telp: body.telp,
        });
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ status: true, message: "Member created" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: true, data: members }),
        });
      }
    });

    await page.route("**/api/admin/members/*", async (route) => {
      if (route.request().method() === "DELETE") {
        members = members.filter((m) => m.id !== 1);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: true, message: "Member deleted" }),
        });
      }
    });

    await page.goto("/admin/members");
    await expect(page.locator("h1")).toContainText("Kelola Data Member");
    await expect(page.locator("body")).toContainText("Dewi Lestari");

    // Tambah member baru
    await page.click("#btn-tambah-member");
    await page.fill("#modal-username", "rudi_baru");
    await page.fill("#modal-password", "secret123");
    await page.fill("#modal-nama", "Rudi Hartono");
    await page.fill("#modal-instansi", "Tech Corp");
    await page.fill("#modal-alamat", "Jl. Ijen");
    await page.fill("#modal-telp", "081999888777");
    await page.click("#btn-submit-member");

    await expect(page.locator('[role="status"]').last()).toContainText(
      "Member baru berhasil ditambahkan."
    );

    // Hapus member
    await page.click("button:has-text('Hapus')");
    await page.click("button:has-text('Ya, Hapus Member')");
    await expect(page.locator('[role="status"]').last()).toContainText("berhasil dihapus.");
  });

  test("CRUD Space: Tambah dengan upload foto fixture dan validasi", async ({
    page,
  }) => {
    let spaces = [
      {
        id: 1,
        nama: "Desk Alpha",
        tipe: "Personal Desk",
        deskripsi: "Meja kerja",
        hargaPerJam: 15000,
        kapasitas: 1,
        fasilitas: ["WiFi"],
        gambar: "test.jpg",
      },
    ];

    await page.route("**/api/admin/spaces", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ status: true, message: "Space created" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: true, data: spaces }),
        });
      }
    });

    await page.goto("/admin/spaces");
    await expect(page.locator("h1")).toContainText("Kelola Ruangan / Space");

    // Buka modal tambah ruangan
    await page.click("#btn-tambah-space");
    await page.fill("#modal-nama-space", "Studio Podcast Beta");
    await page.fill("#modal-tipe-space", "Studio");
    await page.fill("#modal-deskripsi-space", "Studio rekaman kedap suara");
    await page.fill("#modal-harga-space", "100000");
    await page.fill("#modal-kapasitas-space", "3");
    await page.fill("#modal-fasilitas-space", "Mic Rode, Soundcard, AC");

    // Upload file foto via fixture
    const fixturePath = path.resolve(__dirname, "../fixtures/sample.png");
    await page.setInputFiles("#modal-file-space", fixturePath);

    await page.click("#btn-submit-space");
    await expect(page.locator('[role="status"]').last()).toContainText(
      "Ruangan baru berhasil ditambahkan."
    );
  });

  test("CRUD Diskon: Tambah dengan validasi tanggal mulai < tanggal berakhir", async ({
    page,
  }) => {
    const discounts = [
      {
        id: 1,
        nama: "NEWYEAR26",
        persentase: 15,
        tanggalMulai: "2026-01-01",
        tanggalBerakhir: "2026-01-31",
      },
    ];

    await page.route("**/api/admin/diskon", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ status: true, message: "Discount created" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: true, data: discounts }),
        });
      }
    });

    await page.goto("/admin/discount");
    await expect(page.locator("h1")).toContainText("Kelola Diskon & Promo");

    // Coba buat diskon dengan tanggal berakhir sebelum tanggal mulai
    await page.click("#btn-tambah-diskon");
    await page.fill("#modal-nama-diskon", "PROMOSALAH");
    await page.fill("#modal-persentase-diskon", "25");
    await page.fill("#modal-tgl-mulai", "2026-10-10");
    await page.fill("#modal-tgl-akhir", "2026-10-01"); // Tanggal sebelum mulai

    await page.click("#btn-submit-diskon");
    await expect(page.locator("#modal-diskon-error")).toContainText(
      "Tanggal berakhir promo tidak boleh sebelum tanggal mulai."
    );

    // Perbaiki tanggal berakhir menjadi valid
    await page.fill("#modal-tgl-akhir", "2026-10-20");
    await page.click("#btn-submit-diskon");

    await expect(page.locator('[role="status"]').last()).toContainText(
      "Voucher diskon baru berhasil dibuat."
    );
  });
});
