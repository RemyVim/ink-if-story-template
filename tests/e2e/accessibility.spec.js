import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("main story page has no a11y violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("settings modal has no a11y violations", async ({ page }) => {
    await page.locator("#settings-btn").click();
    await expect(page.locator(".settings-modal-content")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("saves modal has no a11y violations", async ({ page }) => {
    await page.locator("#saves-btn").click();
    await expect(page.locator(".saves-modal-content")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("special pages have no a11y violations", async ({ page }) => {
    await page.locator("#pages-menu-btn").click();
    await page.locator(".slide-panel .panel-link").first().click();

    await expect(page.locator(".return-button")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("dark mode has no a11y violations", async ({ page }) => {
    await page.locator("#settings-btn").click();
    const modal = page.locator(".settings-modal-content");
    await modal.locator('select[name="theme"]').selectOption("dark");
    await modal.locator(".modal-close").click();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
