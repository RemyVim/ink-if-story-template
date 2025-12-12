import { test, expect } from "@playwright/test";

test.describe("Story Restart", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("restart button shows confirmation dialog", async ({ page }) => {
    await page.locator("#rewind").click();

    const confirmModal = page.getByRole("dialog", { name: "Confirm" }).first();
    await expect(confirmModal).toBeVisible();
    await expect(confirmModal).toContainText("restart");
  });

  test("canceling restart keeps story state", async ({ page }) => {
    await page.locator("button.choice").first().click();
    const contentAfterChoice = await page.locator("#story").textContent();

    await page.locator("#rewind").click();
    const confirmModal = page.getByRole("dialog", { name: "Confirm" }).first();
    await confirmModal.locator("button", { hasText: "Cancel" }).click();

    const currentContent = await page.locator("#story").textContent();
    expect(currentContent).toBe(contentAfterChoice);
  });

  test("confirming restart returns to beginning", async ({ page }) => {
    const initialContent = await page.locator("#story").textContent();

    await page.locator("button.choice").first().click();

    await page.locator("#rewind").click();
    const confirmModal = page.getByRole("dialog", { name: "Confirm" }).first();
    await confirmModal.locator("button", { hasText: "Restart" }).click();

    await expect(page.locator("#story")).toContainText(
      initialContent.slice(0, 50)
    );
  });
});
