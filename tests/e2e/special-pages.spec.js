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
    await page.locator("p.choice a").first().click();
    const storyContent = await page.locator("#story").textContent();

    await page.locator("#pages-menu-btn").click();
    await page.locator(".slide-panel .panel-link").first().click();

    await expect(async () => {
      const currentContent = await page.locator("#story").textContent();
      expect(currentContent).not.toBe(storyContent);
    }).toPass();

    const returnButton = page.locator(".return-button a");
    await expect(returnButton).toBeVisible();
    await returnButton.click();

    await expect(page.locator("#story")).toContainText(
      storyContent.slice(0, 50)
    );
  });
});
