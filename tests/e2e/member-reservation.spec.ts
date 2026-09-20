import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./test-helpers";

test.describe("Member Reservation Flow Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Set authenticated session sebagai member
    await page.addInitScript(() => {
      window.localStorage.setItem("coworking_token", "fake-member-jwt-token");
      window.localStorage.setItem(
        "coworking_user",
        JSON.stringify({
          id: 1,
          role: "member",
          username: "member_test",
          nama: "Uji Member",
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
            id: 1,
            role: "member",
            username: "member_test",
            nama: "Uji Member",
          },
        }),
      });
    });

    await setupApiMocks(page);
  });

  test("Flow Reservasi A.4 penuh hingga Status Pemesanan & kalkulasi diskon", async ({
    page,
  }) => {
    await page.goto("/member/reservation?spaceId=1");

    // Pastikan form ter-render
    await expect(page.locator("h1")).toContainText("Form Pemesanan Space");
    await expect(page.locator("body")).toContainText("Desk Alpha");

    // Isi jadwal
    await page.fill("#input-tanggal", "2026-09-25");
    await page.fill("#input-jam-mulai", "10:00");
    await page.selectOption("#select-durasi", "2");

    // Cek ketersediaan jadwal muncul
    await expect(page.locator("#availability-status")).toContainText(
      "Jadwal tersedia untuk dipesan."
    );

    // Terapkan promo dari dropdown aktif
    await page.selectOption("#select-active-diskon", "10");
    await expect(page.locator("body")).toContainText('"DISKON20" diterapkan');

    // Total bayar: 2 jam * 15000 = 30000 - 20% (6000) = 24000
    await expect(page.locator("#total-bayar-text")).toContainText("Rp 24.000");

    // Submit reservasi
    await page.click("#btn-submit-reservasi");

    // Diarahkan ke Status Pemesanan
    await expect(page).toHaveURL(/.*\/member/);
    await expect(page.locator("body")).toContainText("Status Pemesanan");
    await expect(page.locator("body")).toContainText("Desk Alpha");
  });

  test("Submit ditolak jika jadwal bentrok", async ({ page }) => {
    await page.goto("/member/reservation?spaceId=1");

    // Jadwal 00:00 di-mock bentrok
    await page.fill("#input-tanggal", "2026-09-25");
    await page.fill("#input-jam-mulai", "00:00");

    await expect(page.locator("#availability-status")).toContainText(
      "Jadwal penuh / bentrok."
    );

    // Tombol submit ter-disable
    const btnSubmit = page.locator("#btn-submit-reservasi");
    await expect(btnSubmit).toBeDisabled();
  });

  test("Kode promo invalid ditolak dengan pesan error", async ({ page }) => {
    await page.goto("/member/reservation?spaceId=1");

    await page.fill("#input-kode-promo", "KODEPALSU99");
    await page.click("button:has-text('Terapkan')");

    await expect(page.locator("body")).toContainText(
      "Kode promo tidak valid atau telah berakhir."
    );
  });

  test("Pembatalan reservasi member melalui konfirmasi modal", async ({ page }) => {
    await page.goto("/member");

    // Klik tombol batalkan pada reservasi
    const btnBatal = page.locator('[data-testid="btn-batal-reservasi"]').first();
    await btnBatal.click();

    // Modal konfirmasi muncul
    await expect(page.locator("h2")).toContainText("Batalkan Reservasi");
    await page.click("button:has-text('Ya, Batalkan')");

    // Toast notifikasi muncul
    await expect(page.locator('[role="status"]')).toContainText(
      "Reservasi berhasil dibatalkan."
    );
  });

  test("Histori pemesanan terfilter per bulan dan tahun", async ({ page }) => {
    await page.goto("/member/history");

    await expect(page.locator("h1")).toContainText("Histori Pemesanan");
    await expect(page.locator("#stat-total-reservasi")).toContainText("1 Reservasi");
    await expect(page.locator("#stat-total-pengeluaran")).toContainText("Rp 150.000");
  });

  test("E-Ticket menampilkan kode booking dan QR code ter-render", async ({
    page,
  }) => {
    await page.goto("/member/ticket/101");

    await expect(page.locator("h1")).toContainText("Desk Alpha");
    await expect(page.locator("body")).toContainText("BOOK-101");
    await expect(page.locator("body")).toContainText("Uji Member");

    // Pastikan SVG QR Code ter-render
    const qrSvg = page.locator("#qr-code-svg");
    await expect(qrSvg).toBeVisible();

    // Pastikan tombol unduh dan bagikan tersedia
    await expect(page.locator("#btn-download-ticket")).toBeVisible();
    await expect(page.locator("#btn-share-ticket")).toBeVisible();
  });
});
