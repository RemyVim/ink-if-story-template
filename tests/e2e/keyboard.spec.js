import { test, expect } from "@playwright/test";

test.describe("Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("number keys select choices", async ({ page }) => {
    const initialContent = await page.locator("#story").textContent();

    await page.keyboard.press("1");

    await expect(async () => {
      const newContent = await page.locator("#story").textContent();
      expect(newContent).not.toBe(initialContent);
    }).toPass();
  });

  test("Ctrl+S opens saves modal", async ({ page }) => {
    await page.keyboard.press("Control+s");

    const modal = page.locator(".saves-modal-content");
    await expect(modal).toBeVisible();
  });

  test("Ctrl+, opens settings modal", async ({ page }) => {
    await page.keyboard.press("Control+,");

    const modal = page.locator(".settings-modal-content");
    await expect(modal).toBeVisible();
  });

  test("Escape closes open modal", async ({ page }) => {
    await page.keyboard.press("Control+,");
    const modal = page.locator(".settings-modal-content");
    await expect(modal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("keyboard shortcuts can be disabled", async ({ page }) => {
    await page.locator("#settings-btn").click();
    const settingsModal = page.locator(".settings-modal-content");

    await settingsModal.locator('[data-tab="accessibility"]').click();

    const checkbox = settingsModal.locator('input[name="keyboardShortcuts"]');
    await checkbox.uncheck();

    await settingsModal.locator(".modal-close").click();
    await expect(settingsModal).not.toBeVisible();

    const contentBefore = await page.locator("#story").textContent();

    await page.keyboard.press("1");
    await page.waitForTimeout(200);

    const contentAfter = await page.locator("#story").textContent();
    expect(contentAfter).toBe(contentBefore);
  });
});
