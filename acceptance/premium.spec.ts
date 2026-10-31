import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
test("guided states, deferred workspace loading and filter recovery", async ({
  page,
}) => {
  page.setDefaultTimeout(10000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const workspaceRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/src/App.tsx"))
      workspaceRequests.push(request.url());
  });
  await page.route("**/src/App.tsx*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.continue();
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect(workspaceRequests).toEqual([]);
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Polish Owner");
  await page
    .getByLabel("Email address", { exact: true })
    .fill(randomUUID() + "@example.test");
  await page.getByLabel("Password", { exact: true }).fill("BrowserOnly#4827");
  await page
    .getByRole("button", { name: "Create workspace", exact: true })
    .click();
  await expect(
    page.getByRole("main", { name: "Loading workspace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Your next great hire starts here.",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Add your first candidate", exact: true })
    .click();
  await page.getByLabel("Full name", { exact: true }).fill("Polish Candidate");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("candidate@example.test");
  await page.getByLabel("Phone number", { exact: true }).fill("9876543210");
  await page.getByLabel("Years of experience", { exact: true }).fill("4");
  await page.getByLabel("Skills", { exact: true }).fill("React, TypeScript");
  await page
    .getByRole("button", { name: "Add candidate", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "View Polish Candidate", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search candidates").fill("no-such-person");
  await expect(
    page.getByRole("heading", { name: "No candidates found", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "View Polish Candidate", exact: true }),
  ).toBeVisible();
  expect(workspaceRequests.length).toBeGreaterThan(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
