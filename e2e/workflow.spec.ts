import { test, expect } from "@playwright/test";
test("intake → search → detail → status → reload, edit, keyboard and mobile", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:4173")) external.push(r.url());
  });
  await page.goto("/");
  await page.screenshot({
    path: "artifacts/overview-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Add candidate", exact: true }).click();
  await page.getByRole("button", { name: "Add demo candidate" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("Full name").fill("Morgan Demo");
  await page.getByLabel("Email address").fill("morgan@example.com");
  await page.getByLabel("Phone number").fill("+1 202 555 0199");
  await page.getByLabel("Years of experience").fill("4");
  await page.getByLabel("Skills", { exact: true }).fill("React, TypeScript");
  await page.screenshot({
    path: "artifacts/intake-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Add demo candidate" }).click();
  await page
    .getByRole("textbox", { name: "Search candidates" })
    .fill("Morgan Demo");
  await expect(page).toHaveURL(/q=Morgan/);
  await page.reload();
  await page.getByRole("button", { name: "View Morgan Demo" }).click();
  await page.getByRole("button", { name: "Shortlist", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByText("Shortlisted", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/candidate-detail.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "View Morgan Demo" }),
  ).toBeFocused();
  await page.reload();
  await expect(
    page.getByRole("table").getByText("Shortlisted", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View Morgan Demo" }).click();
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.getByLabel("Full name").fill("Morgan Demo Updated");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Morgan Demo Updated" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByText("Rejected", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reopen" }).click();
  await expect(
    page.getByRole("dialog").getByText("In review", { exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({
    path: "artifacts/overview-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Candidate intake" }).click();
  await page.screenshot({
    path: "artifacts/intake-mobile.png",
    fullPage: true,
  });
  expect(external).toEqual([]);
});
test("legacy routes, filters, pagination and confirmed reset", async ({
  page,
}) => {
  await page.goto("/dashboard/frontend");
  await expect(page.getByLabel("Filter by role")).toHaveAttribute("data-value", "Front-End Developer");
  await page.goto("/register");
  await expect(page).toHaveURL(/\/intake$/);
  await page.goto("/home");
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page).toHaveURL(/page=2/);
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep my changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Demo workspace reset.");
});
test("corrupt storage recovery and failed save stay truthful", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("forma.candidates.v1", "broken"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "Saved data could not be read",
  );
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await expect(page.getByRole("alert")).not.toBeVisible();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw Error("quota");
    };
  });
  await page.getByRole("button", { name: "View Jordan Ellis" }).click();
  await page.getByRole("button", { name: "Shortlist", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Unable to save");
  await expect(
    page.getByRole("dialog").getByText("In review", { exact: true }),
  ).toBeVisible();
});
