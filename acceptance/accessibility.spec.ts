import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

async function check(page: Page) {
  await expect(page.getByRole("main")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const { violations } = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
      "best-practice",
    ])
    .analyze();
  expect(
    violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map((node) => node.target),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}

test("accessible account, routes and dialogs on desktop and mobile", async ({
  page,
}) => {
  test.setTimeout(120000);
  page.setDefaultTimeout(10000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await check(page);
  }
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await check(page);
  await page
    .getByLabel("Your name", { exact: true })
    .fill("Accessibility Owner");
  await page
    .getByLabel("Email address", { exact: true })
    .fill(randomUUID() + "@example.test");
  await page.getByLabel("Password", { exact: true }).fill("BrowserOnly#4827");
  await page
    .getByRole("button", { name: "Create workspace", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Account controls", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Candidate intake", exact: true })
    .click();
  await page.getByLabel("Full name", { exact: true }).fill("Candidate Fixture");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("candidate@example.test");
  await page.getByLabel("Phone number", { exact: true }).fill("9876543210");
  await page.getByLabel("Years of experience", { exact: true }).fill("3");
  await page.getByLabel("Skills", { exact: true }).fill("TypeScript, React");
  await page
    .getByRole("button", { name: "Add candidate", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "View Candidate Fixture", exact: true }),
  ).toBeVisible();
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const name of ["Overview", "Candidates", "Candidate intake"]) {
        await page
          .getByRole("link", {
            name: name === "Candidates" ? /^Candidates/ : name,
            exact: true,
          })
          .click();
        await expect(page.getByRole("main")).toBeFocused();
        await check(page);
      }
      const trigger = page
        .getByRole("button", { name: "Account", exact: true })
        .first();
      await trigger.click();
      const dialog = page.getByRole("dialog").last();
      await expect(dialog).toBeVisible();
      // Background landmarks are intentionally hidden while a modal is open.
      const { violations } = await new AxeBuilder({ page })
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
          "best-practice",
        ])
        .analyze();
      expect(
        violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map((node) => node.target),
        })),
      ).toEqual([]);
      for (let i = 0; i < 18; i++) {
        await page.keyboard.press("Tab");
        expect(
          await dialog.evaluate((node) =>
            node.contains(document.activeElement),
          ),
        ).toBe(true);
      }
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
  }
  expect(errors).toEqual([]);
});
