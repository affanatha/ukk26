import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./test-helpers";

test.describe("Member Catalog Suite", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("Menampilkan katalog ruangan dan melakukan filter tipe", async ({ page }) => {
    await page.goto("/");

    // Pastikan katalog tampil
    await expect(page.locator("h1")).toContainText("Pilih Ruangan Coworking Terbaik");
    await expect(page.locator('[data-testid="space-card"]')).toHaveCount(2);

    // Klik tab filter tipe "Personal Desk"
    const tabPersonalDesk = page.locator("#tab-tipe-filter button", {
      hasText: "Personal Desk",
    });
    await tabPersonalDesk.click();

    // Verifikasi request dengan query tipe
    await expect(page.locator('[data-testid="space-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="space-card"]')).toContainText("Desk Alpha");
  });

  test("Melakukan pencarian nama ruangan via search box", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator("#search-input");
    await searchInput.fill("Meeting");

    // Tunggu hasil filter
    await expect(page.locator('[data-testid="space-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="space-card"]')).toContainText("Meeting Room Beta");
  });

  test("Membuka detail space dengan informasi lengkap", async ({ page }) => {
    await page.goto("/member/1");

    await expect(page.locator("#space-title")).toHaveText("Desk Alpha");
    await expect(page.locator("body")).toContainText("Personal Desk");
    await expect(page.locator("body")).toContainText("Kapasitas hingga 1 orang");
    await expect(page.locator("body")).toContainText("WiFi");
    await expect(page.locator("body")).toContainText("Rp 15.000");

    // Tombol pesan ruangan mengarah ke form reservasi
    const btnPesan = page.locator("#btn-pesan-dari-detail");
    await expect(btnPesan).toHaveAttribute(
      "href",
      "/member/reservation?spaceId=1"
    );
  });
});
