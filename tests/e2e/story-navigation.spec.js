import { test, expect } from "@playwright/test";

test.describe("Story Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loading-screen")).toBeHidden();
  });

  test("clicking a choice advances the story", async ({ page }) => {
    const initialText = await page.locator("#story").textContent();

    const firstChoice = page.locator("p.choice a").first();
    await firstChoice.click();

    await expect(async () => {
      const newText = await page.locator("#story").textContent();
      expect(newText).not.toBe(initialText);
    }).toPass();
  });

  test("can navigate through multiple choices and choices change at least once", async ({
    page,
  }) => {
    const getChoiceTexts = async () => {
      const choices = page.locator("p.choice a");
      const count = await choices.count();
      const texts = [];
      for (let i = 0; i < count; i++) {
        texts.push(await choices.nth(i).textContent());
      }
      return texts.sort().join("|");
    };

    const initialChoices = await getChoiceTexts();
    let choicesChangedAtLeastOnce = false;
    const steps = 5;

    for (let i = 0; i < steps; i++) {
      const choices = page.locator("p.choice a");
      const choiceCount = await choices.count();

      if (choiceCount === 0) break;

      const randomIndex = Math.floor(Math.random() * choiceCount);
      await choices.nth(randomIndex).click();

      await expect(page.locator("#story p").first()).toBeVisible();

      const currentChoices = await getChoiceTexts();
      if (currentChoices !== initialChoices) {
        choicesChangedAtLeastOnce = true;
      }
    }

    expect(
      choicesChangedAtLeastOnce,
      "Choices should change at least once during navigation"
    ).toBe(true);
  });

  test("unclickable choices are not clickable", async ({ page }) => {
    const choicesLink = page.locator("p.choice a", { hasText: /choice/i });
    await choicesLink.first().click();

    const unclickableChoice = page.locator("p.choice span.unclickable");
    await expect(unclickableChoice.first()).toBeVisible();

    const parentChoice = unclickableChoice.first().locator("..");
    await expect(parentChoice.locator("a")).toHaveCount(0);
  });
});
