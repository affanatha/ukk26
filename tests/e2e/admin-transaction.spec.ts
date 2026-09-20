import { test, expect } from "@playwright/test";

test.describe("Admin Transaction Suite", () => {
  test.beforeEach(async ({ page }) => {
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

    await page.route("**/api/admin/spaces", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: [{ id: 1, nama_space: "Desk Alpha" }],
        }),
      });
    });
  });

  test("Filter reservasi berdasarkan bulan, status, dan membuka modal kelola", async ({
    page,
  }) => {
    await page.route("**/api/admin/reservasi?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: [
            {
              id: 50,
              kode: "BOOK-50",
              nama_space: "Desk Alpha",
              nama_member: "Citra Kirana",
              tanggal: "2026-09-20",
              jam_mulai: "09:00",
              durasi_jam: 3,
              total_bayar: 45000,
              status: "disetujui",
            },
          ],
        }),
      });
    });

    await page.goto("/admin/reservation");
    await expect(page.locator("h1")).toContainText("Semua Reservasi");

    // Filter status
    await page.selectOption("#filter-status", "disetujui");
    await expect(page.locator("#table-admin-reservations")).toContainText("Citra Kirana");

    // Klik baris reservasi untuk membuka modal Layar B.7
    await page.click("tr:has-text('Citra Kirana')");
    await expect(page.locator("#modal-kelola-reservasi")).toBeVisible();
    await expect(page.locator("#modal-kelola-reservasi")).toContainText("Citra Kirana");
  });

  test("Alur Transaksi: Ubah status disetujui → Check-in → Check-out hingga selesai", async ({
    page,
  }) => {
    let currentStatus = "menunggu";
    let checkInTime: string | null = null;
    let checkOutTime: string | null = null;

    await page.route("**/api/admin/reservasi?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: [
            {
              id: 88,
              kode: "BOOK-88",
              nama_space: "Desk Alpha",
              nama_member: "Dimas Anggara",
              tanggal: "2026-09-20",
              jam_mulai: "10:00",
              durasi_jam: 2,
              total_bayar: 30000,
              status: currentStatus,
              checkIn: checkInTime,
              checkOut: checkOutTime,
            },
          ],
        }),
      });
    });

    // Mock endpoints
    await page.route("**/api/admin/reservasi/88/status", async (route) => {
      const data = route.request().postDataJSON();
      currentStatus = data.status;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: true }) });
    });

    await page.route("**/api/admin/reservasi/88/check-in", async (route) => {
      currentStatus = "aktif";
      checkInTime = "10:05";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: true }) });
    });

    await page.route("**/api/admin/reservasi/88/check-out", async (route) => {
      currentStatus = "selesai";
      checkOutTime = "12:00";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: true }) });
    });

    await page.goto("/admin/reservation");
    await page.click("tr:has-text('Dimas Anggara')");

    // 1. Ubah status menjadi 'disetujui'
    await page.selectOption("#select-ubah-status", "disetujui");
    await page.click("#btn-terapkan-status");
    await expect(page.locator('[role="status"]').last()).toContainText("diubah menjadi \"disetujui\"");

    // 2. Buka lagi modal transaksi, lakukan check-in
    await page.click("tr:has-text('Dimas Anggara')");
    await expect(page.locator("#btn-checkin-modal")).toBeVisible();
    await page.click("#btn-checkin-modal");
    await expect(page.locator('[role="status"]').filter({ hasText: "Check-in member berhasil" })).toBeVisible();

    // 3. Buka lagi modal transaksi, lakukan check-out
    await page.click("tr:has-text('Dimas Anggara')");
    await expect(page.locator("#btn-checkout-modal")).toBeVisible();
    await page.click("#btn-checkout-modal");
    await expect(page.locator('[role="status"]').filter({ hasText: "Check-out member berhasil" })).toBeVisible();
  });
});
