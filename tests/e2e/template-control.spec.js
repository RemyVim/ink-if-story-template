import { test, expect } from "@playwright/test";

test.describe("Template Control Functions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  /**
   * Helper to navigate to the Template Control demo section
   */
  async function goToTemplateControlDemo(page) {
    const templateControlChoice = page.locator("button.choice", {
      hasText: "Template Control",
    });
    await templateControlChoice.click();
    await expect(page.locator("#story h2")).toContainText("Template Control");
  }

  test.describe("OPEN_PAGE function", () => {
    test("opens special page when called from ink", async ({ page }) => {
      await goToTemplateControlDemo(page);

      const openPageChoice = page.locator("button.choice", {
        hasText: /OPEN_PAGE\("content_warnings"\)/,
      });
      await openPageChoice.click();

      await expect(page.locator("#story h2")).toContainText("Content Warnings");

      const returnButton = page.locator("button.return-button");
      await expect(returnButton).toBeVisible();
    });

    test("returns to story after viewing page opened via function", async ({
      page,
    }) => {
      await goToTemplateControlDemo(page);

      const openPageChoice = page.locator("button.choice", {
        hasText: /OPEN_PAGE\("content_warnings"\)/,
      });
      await openPageChoice.click();

      await expect(page.locator("#story h2")).toContainText("Content Warnings");

      const returnButton = page.locator("button.return-button");
      await returnButton.click();

      await expect(
        page.locator("button.choice", { hasText: /OPEN_SAVES/ })
      ).toBeVisible();
      await expect(
        page.locator("button.choice", { hasText: /Return to feature menu/ })
      ).toBeVisible();
    });

    test("does not show content after OPEN_PAGE call", async ({ page }) => {
      await goToTemplateControlDemo(page);

      const openPageChoice = page.locator("button.choice", {
        hasText: /OPEN_PAGE\("content_warnings"\)/,
      });
      await openPageChoice.click();

      await expect(page.locator("#story")).not.toContainText("function called");
    });
  });

  test.describe("OPEN_SAVES function", () => {
    test("opens saves modal when called from ink", async ({ page }) => {
      await goToTemplateControlDemo(page);

      const openSavesChoice = page.locator("button.choice", {
        hasText: /OPEN_SAVES/,
      });
      await openSavesChoice.click();

      const modal = page.locator(".saves-modal-content");
      await expect(modal).toBeVisible();
    });
  });

  test.describe("OPEN_SETTINGS function", () => {
    test("opens settings modal when called from ink", async ({ page }) => {
      await goToTemplateControlDemo(page);

      const openSettingsChoice = page.locator("button.choice", {
        hasText: /OPEN_SETTINGS/,
      });
      await openSettingsChoice.click();

      const modal = page.locator(".settings-modal-content");
      await expect(modal).toBeVisible();
    });
  });

  test.describe("RESTART function", () => {
    test("shows confirmation dialog when called from ink", async ({ page }) => {
      await goToTemplateControlDemo(page);

      const restartChoice = page.locator("button.choice", {
        hasText: "RESTART()",
      });
      await restartChoice.click();

      const confirmModal = page
        .getByRole("dialog", { name: "Confirm" })
        .first();
      await expect(confirmModal).toBeVisible();
      await expect(confirmModal).toContainText(/restart/i);
    });

    test("restarts story when confirmed", async ({ page }) => {
      await goToTemplateControlDemo(page);

      const restartChoice = page.locator("button.choice", {
        hasText: "RESTART()",
      });
      await restartChoice.click();

      const confirmModal = page
        .getByRole("dialog", { name: "Confirm" })
        .first();
      await confirmModal.locator("button", { hasText: "Restart" }).click();

      await expect(page.locator("#story h2")).toContainText(
        "Template Feature Demo"
      );
    });
  });

  test.describe("RESTART tag", () => {
    test("shows confirmation dialog when # RESTART tag is used", async ({
      page,
    }) => {
      await goToTemplateControlDemo(page);

      const restartTagChoice = page.locator("button.choice", {
        hasText: "# RESTART tag",
      });
      await restartTagChoice.click();

      const confirmModal = page
        .getByRole("dialog", { name: "Confirm" })
        .first();
      await expect(confirmModal).toBeVisible();
    });
  });
});
