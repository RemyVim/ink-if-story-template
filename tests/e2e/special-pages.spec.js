import { test, expect } from "@playwright/test";

test.describe("Special Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("can open and close pages menu", async ({ page }) => {
    await page.locator("#pages-menu-btn").click();

    const panel = page.locator(".slide-panel");
    await expect(panel).toBeVisible();

    await panel.locator(".panel-close-bottom").click();
    await expect(panel).not.toBeVisible();
  });

  test("can navigate to a special page", async ({ page }) => {
    const initialContent = await page.locator("#story").textContent();

    await page.locator("#pages-menu-btn").click();
    const panel = page.locator(".slide-panel");
    await expect(panel).toBeVisible();

    await panel.locator(".panel-link").first().click();

    await expect(async () => {
      const newContent = await page.locator("#story").textContent();
      expect(newContent).not.toBe(initialContent);
    }).toPass();
  });

  test("can return to story from special page", async ({ page }) => {
    await page.locator("button.choice").first().click();

    await page.locator("#pages-menu-btn").click();
    await page.locator(".slide-panel .panel-link").first().click();

    await expect(async () => {
      const currentContent = await page.locator("#story").textContent();
      expect(currentContent).toContain("Character Stats");
    }).toPass();

    const returnButton = page.getByRole("button", { name: /return to story/i });
    await expect(returnButton).toBeVisible();
    await returnButton.click();

    await expect(page.locator("#story h2")).toContainText("Save & Load");
  });
});
