import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { z } from "zod";
async function register(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Product Owner");
  await page
    .getByLabel("Email address", { exact: true })
    .fill(randomUUID() + "@example.test");
  await page.getByLabel("Password", { exact: true }).fill("BrowserOnly#4827");
  await page
    .getByRole("button", { name: "Create workspace", exact: true })
    .click();
  await expect(page.locator(".platform-session")).toBeVisible();
}
async function seed(page: Page, records: unknown[]) {
  const session = z
    .object({ csrfToken: z.string() })
    .parse(
      await page.request
        .get("/api/session")
        .then((response) => response.json()),
    );
  const response = await page.request.put("/api/workspace", {
    data: { revision: 0, records },
    headers: { "X-CSRFToken": session.csrfToken },
  });
  expect(response.ok()).toBe(true);
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
}

test("saved candidate views remain account-scoped and bulk changes require review", async ({
  page,
}, testInfo) => {
  page.setDefaultTimeout(10000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await register(page);
  const stamp = new Date().toISOString();
  const candidates = ["Avery Morgan", "Jordan Ellis"].map((name, i) => ({
    id: "candidate-" + i,
    name,
    email: `candidate${i}@example.test`,
    phone: "1234567890",
    experience: 3,
    skills: "React",
    jobTitle: "Front-End Developer",
    status: "applied",
    createdAt: stamp,
  }));
  await seed(page, candidates);
  await page.getByRole("link", { name: /^Candidates/ }).click();
  await page.getByLabel("Search candidates", { exact: true }).fill("Avery");
  await page
    .getByLabel("Saved view name", { exact: true })
    .fill("Avery review");
  await page
    .getByRole("button", { name: "Save this view", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Avery review", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Select Avery Morgan", { exact: true }).check();
  await page
    .getByRole("button", { name: "Review status update", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Update selected candidates?",
    exact: true,
  });
  await expect(dialog).toContainText("Avery Morgan");
  await dialog
    .getByRole("button", { name: "Cancel update", exact: true })
    .click();
  let saved = (await page.request
    .get("/api/workspace")
    .then((response) => response.json())) as {
    records: { id: string; status: string }[];
  };
  expect(saved.records.map((record) => record.status)).toEqual([
    "applied",
    "applied",
  ]);
  await page
    .getByRole("button", { name: "Review status update", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Confirm status update", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText("Candidate statuses updated.", { exact: true }),
  ).toBeVisible();
  saved = (await page.request
    .get("/api/workspace")
    .then((response) => response.json())) as {
    records: { id: string; status: string }[];
  };
  expect(saved.records.map((record) => record.status)).toEqual([
    "shortlisted",
    "applied",
  ]);
  await page.goto("/candidates");
  await page.getByRole("button", { name: "Avery review", exact: true }).click();
  await expect(
    page.getByLabel("Search candidates", { exact: true }),
  ).toHaveValue("Avery");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("region", { name: "Saved candidate views" })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("saved-views-phone.png") });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await register(page);
  await expect(
    page.getByRole("button", { name: "Avery review", exact: true }),
  ).toHaveCount(0);
});
