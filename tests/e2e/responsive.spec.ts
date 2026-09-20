import { test, expect } from "@playwright/test";
import { setupApiMocks } from "./test-helpers";

const BREAKPOINTS = [
  { name: "Mobile (iPhone SE)", width: 375, height: 667 },
  { name: "Tablet (iPad)", width: 768, height: 1024 },
  { name: "Desktop (Laptop/Monitor)", width: 1440, height: 900 },
];

test.describe("Responsive Design Suite", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  for (const bp of BREAKPOINTS) {
    test(`Halaman beranda bebas horizontal overflow pada breakpoint ${bp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto("/");

      // Verifikasi tidak ada horizontal scroll overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);

      // Verifikasi navigasi dapat diakses
      if (bp.width < 768) {
        // Mobile hamburger toggle visible
        await expect(
          page.locator('button[aria-label="Toggle menu"]')
        ).toBeVisible();
      } else {
        // Desktop nav links visible
        await expect(page.locator("nav a:has-text('Katalog Space')")).toBeVisible();
      }
    });

    test(`Halaman login bebas horizontal overflow pada breakpoint ${bp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto("/auth/Login");

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
      await expect(page.locator("#btn-login")).toBeVisible();
    });
  }
});
