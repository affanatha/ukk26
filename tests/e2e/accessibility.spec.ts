import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { setupApiMocks } from "./test-helpers";

test.describe("Accessibility (a11y) Suite", () => {
  test("Halaman beranda katalog tidak memiliki pelanggaran critical/serious", async ({
    page,
  }) => {
    await setupApiMocks(page);
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(seriousOrCritical).toEqual([]);
  });

  test("Halaman Login tidak memiliki pelanggaran critical/serious", async ({
    page,
  }) => {
    await page.goto("/auth/Login");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(seriousOrCritical).toEqual([]);
  });

  test("Halaman Register tidak memiliki pelanggaran critical/serious", async ({
    page,
  }) => {
    await page.goto("/auth/Register");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(seriousOrCritical).toEqual([]);
  });
});
