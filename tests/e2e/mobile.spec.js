import { test, expect } from "@playwright/test";

test.describe("Mobile Viewport", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("story content displays correctly", async ({ page }) => {
    await expect(page.locator("#story")).toBeVisible();
    await expect(page.locator("h1.nav-title")).toBeVisible();

    const firstChoice = page.locator("p.choice").first();
    await expect(firstChoice).toBeVisible();
  });

  test("navigation buttons are accessible", async ({ page }) => {
    await expect(page.locator("#settings-btn")).toBeVisible();
    await expect(page.locator("#saves-btn")).toBeVisible();
    await expect(page.locator("#rewind")).toBeVisible();
  });

  test("settings modal works on mobile", async ({ page }) => {
    await page.locator("#settings-btn").click();

    const modal = page.locator(".settings-modal-content");
    await expect(modal).toBeVisible();

    await modal.locator('select[name="theme"]').selectOption("dark");
    await expect(page.locator("body")).toHaveClass(/dark/);
  });

  test("choices are tappable", async ({ page }) => {
    const initialContent = await page.locator("#story").textContent();

    await page.locator("p.choice a").first().click();
    await expect(async () => {
      const newContent = await page.locator("#story").textContent();
      expect(newContent).not.toBe(initialContent);
    }).toPass();
  });

  test("pages menu works on mobile", async ({ page }) => {
    await page.locator("#pages-menu-btn").click();

    const panel = page.locator(".slide-panel");
    await expect(panel).toBeVisible();

    await panel.locator(".panel-link").first().click();
    await expect(page.locator(".return-button")).toBeVisible();
  });
});
