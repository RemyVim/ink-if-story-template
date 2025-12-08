import { test, expect } from "@playwright/test";

test.describe("Save System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("can open and close saves modal", async ({ page }) => {
    await page.locator("#saves-btn").click();

    const modal = page.locator(".saves-modal-content");
    await expect(modal).toBeVisible();

    await modal.locator(".modal-close").click();
    await expect(modal).not.toBeVisible();
  });

  test("can save to a slot and load from it", async ({ page }) => {
    await page.locator("p.choice a").first().click();
    await expect(page.locator("#story p").first()).toBeVisible();

    const textAfterChoice = await page.locator("#story").textContent();

    await page.locator("#saves-btn").click();
    const modal = page.locator(".saves-modal-content");
    await expect(modal).toBeVisible();

    const slot1 = modal.locator('[data-slot="1"]');
    await slot1.locator(".save-to-slot").click();

    await modal.locator(".modal-close").click();

    await page.locator("#rewind").click();
    const confirmModal = page.getByRole("dialog", { name: "Confirm" }).first();
    await expect(confirmModal).toBeVisible();
    await confirmModal.locator("button", { hasText: "Restart" }).click();

    await expect(page.locator("#story")).not.toContainText(
      textAfterChoice.slice(0, 50)
    );

    await page.locator("#saves-btn").click();
    await expect(modal).toBeVisible();
    await slot1.locator(".load-from-slot").click();

    await expect(page.locator("#story")).toContainText(
      textAfterChoice.slice(0, 50)
    );
  });

  test("save data persists to localStorage", async ({ page }) => {
    await page.locator("#saves-btn").click();
    const modal = page.locator(".saves-modal-content");
    const slot1 = modal.locator('[data-slot="1"]');
    await slot1.locator(".save-to-slot").click();
    await modal.locator(".modal-close").click();

    const saveData = await page.evaluate(() => {
      const stored = localStorage.getItem("ink-save-slot-1");
      return stored ? JSON.parse(stored) : null;
    });

    expect(saveData).not.toBeNull();
    expect(saveData.gameState).toBeDefined();
    expect(saveData.timestamp).toBeDefined();
  });
});
