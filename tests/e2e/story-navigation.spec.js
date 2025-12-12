import { test, expect } from "@playwright/test";

test.describe("Story Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("clicking a choice advances the story", async ({ page }) => {
    const initialText = await page.locator("#story").textContent();

    const firstChoice = page.locator("button.choice").first();
    await firstChoice.click();

    await expect(async () => {
      const newText = await page.locator("#story").textContent();
      expect(newText).not.toBe(initialText);
    }).toPass();
  });

  test("can navigate through multiple choices and choices change", async ({
    page,
  }) => {
    const getChoiceTexts = async () => {
      const choices = page.locator("button.choice");
      const texts = await choices.allTextContents();
      return texts.sort().join("|");
    };

    const initialChoices = await getChoiceTexts();

    // Navigate to choices demo (known to have different choices)
    const choicesLink = page.locator("button.choice", { hasText: /choices$/i });
    await choicesLink.first().click();

    await expect(page.locator("#story p").first()).toBeVisible();

    const newChoices = await getChoiceTexts();
    expect(newChoices).not.toBe(initialChoices);
  });

  test("unclickable choices are not clickable", async ({ page }) => {
    const choicesLink = page.getByRole("button", { name: /choices$/i });
    await choicesLink.click();

    const unclickableChoice = page.locator("button.choice.unclickable");
    await expect(unclickableChoice.first()).toBeVisible();
    await expect(unclickableChoice.first()).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });
});
