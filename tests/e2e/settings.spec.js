import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("can open and close settings modal", async ({ page }) => {
    await page.locator("#settings-btn").click();

    const modal = page.locator(".settings-modal-content");
    await expect(modal).toBeVisible();

    await modal.locator(".modal-close").click();
    await expect(modal).not.toBeVisible();
  });

  test("can change theme to dark mode", async ({ page }) => {
    await page.locator("#settings-btn").click();
    const modal = page.locator(".settings-modal-content");
    await expect(modal).toBeVisible();

    await modal.locator('select[name="theme"]').selectOption("dark");

    await expect(page.locator("body")).toHaveClass(/dark/);
  });

  test("settings persist to localStorage", async ({ page }) => {
    await page.locator("#settings-btn").click();
    const modal = page.locator(".settings-modal-content");
    await modal.locator('select[name="fontFamily"]').selectOption("sans");

    await modal.locator(".modal-close").click();

    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem("ink-template-settings");
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings).not.toBeNull();
    expect(settings.fontFamily).toBe("sans");

    await page.locator("#settings-btn").click();
    await expect(modal.locator('select[name="fontFamily"]')).toHaveValue(
      "sans"
    );
  });
});
