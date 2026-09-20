import { test, expect } from "@playwright/test";

test.describe("Admin Report Suite", () => {
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

    // Mock laporan bulanan & income
    await page.route("**/api/admin/reports/monthly?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            total_reservasi: 18,
            total_selesai: 15,
          },
        }),
      });
    });

    await page.route("**/api/admin/reports/income?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            total_pendapatan: 3500000,
            harian: [
              { tanggal: "2026-09-01", total_pendapatan: 150000 },
              { tanggal: "2026-09-02", total_pendapatan: 300000 },
              { tanggal: "2026-09-03", total_pendapatan: 250000 },
            ],
            breakdown_tipe: [
              { tipe_space: "Personal Desk", total_pendapatan: 1200000, jumlah_reservasi: 12 },
              { tipe_space: "Meeting Room", total_pendapatan: 2300000, jumlah_reservasi: 6 },
            ],
          },
        }),
      });
    });

    await page.route("**/api/admin/reservasi?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: true, data: [] }),
      });
    });
  });

  test("Menampilkan metrik laporan pendapatan dan chart Recharts ter-render", async ({
    page,
  }) => {
    await page.goto("/admin/reports");

    await expect(page.locator("h1")).toContainText("Rekapitulasi Pendapatan");

    // Metrik total pemesanan & pendapatan tampil
    await expect(page.locator("#stat-report-reservasi")).toContainText("18 Transaksi");
    await expect(page.locator("#stat-report-pendapatan")).toContainText("Rp 3.500.000");

    // Container grafik garis Recharts ter-render dengan SVG
    const chartContainer = page.locator("#chart-container");
    await expect(chartContainer).toBeVisible();
    await expect(chartContainer.locator("svg")).toBeVisible();

    // Breakdown per tipe space tampil
    await expect(page.locator("body")).toContainText("Personal Desk");
    await expect(page.locator("body")).toContainText("Meeting Room");
  });
});
