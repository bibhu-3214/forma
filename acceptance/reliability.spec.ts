import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
test("interrupted save recovers only after review and clears after success/sign-out", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Recovery Owner");
  await page
    .getByLabel("Email address", { exact: true })
    .fill(randomUUID() + "@example.test");
  await page.getByLabel("Password", { exact: true }).fill("BrowserOnly#4827");
  await page
    .getByRole("button", { name: "Create workspace", exact: true })
    .click();
  await expect(page.locator(".platform-session")).toBeVisible();
  await page
    .getByRole("link", { name: "Candidate intake", exact: true })
    .click();
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Recovered Candidate");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("candidate@example.test");
  await page.getByLabel("Phone number", { exact: true }).fill("1234567890");
  await page.getByLabel("Years of experience", { exact: true }).fill("3");
  await page
    .getByLabel("Skills", { exact: true })
    .fill("Accessible TypeScript");
  let writes = 0;
  await page.route("**/api/workspace", async (route) => {
    if (route.request().method() === "PUT") {
      writes++;
      await route.abort("internetdisconnected");
    } else await route.continue();
  });
  await page
    .getByRole("button", { name: "Add candidate", exact: true })
    .click();
  await expect(
    page.getByText(/check whether your change was saved/).first(),
  ).toBeVisible();
  expect(writes).toBe(1);
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Recovered Candidate",
  );
  page.once("dialog", (dialog) => void dialog.accept());
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Recover draft", exact: true }),
  ).toBeVisible();
  expect(
    (
      (await page.request
        .get("/api/workspace")
        .then((response) => response.json())) as { records: unknown[] }
    ).records,
  ).toHaveLength(0);
  await page.screenshot({ path: testInfo.outputPath("draft-recovery.png") });
  await page
    .getByRole("button", { name: "Recover draft", exact: true })
    .click();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Recovered Candidate",
  );
  await page.unroute("**/api/workspace");
  await page
    .getByRole("button", { name: "Add candidate", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "View Recovered Candidate", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(sessionStorage).filter((key) =>
        key.includes(".tab-draft.v1."),
      ),
    ),
  ).toEqual([]);
  await page
    .getByRole("link", { name: "Candidate intake", exact: true })
    .click();
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Recovered Candidate");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("candidate@example.test");
  await page.getByLabel("Phone number", { exact: true }).fill("1234567890");
  await page.getByLabel("Years of experience", { exact: true }).fill("3");
  await page
    .getByLabel("Skills", { exact: true })
    .fill("Accessible TypeScript");
  await page.evaluate(() =>
    sessionStorage.setItem("forma.tab-draft.v1.another", "private"),
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(sessionStorage).filter((key) =>
        key.includes(".tab-draft.v1."),
      ),
    ),
  ).toEqual([]);
});
