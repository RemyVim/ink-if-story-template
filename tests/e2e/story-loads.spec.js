import { test, expect } from "@playwright/test";

test.describe("Story Loading", () => {
  test("loads the story and displays the title", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#loading-screen")).toBeHidden();

    const title = page.locator("h1.nav-title");
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();
  });

  test("displays story content", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#loading-screen")).toBeHidden();

    const storyContainer = page.locator("#story");
    await expect(storyContainer).toBeVisible();

    const paragraph = storyContainer
      .locator("p:not(.choice)")
      .filter({ hasText: /\S/ })
      .first();
    await expect(paragraph).toBeVisible();
  });

  test("displays clickable choices", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#loading-screen")).toBeHidden();

    const firstChoice = page.locator("p.choice").first();
    await expect(firstChoice).toBeVisible();

    const choiceLink = firstChoice.locator("a");
    await expect(choiceLink).toBeVisible();
  });
});
