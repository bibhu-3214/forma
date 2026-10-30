import { test, expect } from "@playwright/test";
test("Tailwind option panels preserve spacing, keyboard focus and native-dialog editing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/candidates?role=Front-End%20Developer");
      for (const picker of await page.getByRole("combobox").all()) {
        expect(await picker.evaluate((element) => element.tagName)).toBe(
          "BUTTON",
        );
        const geometry = await picker.evaluate((element) => {
          const box = element.getBoundingClientRect(),
            icon = element.querySelector("svg")!.getBoundingClientRect();
          return { right: box.right, iconRight: icon.right, left: box.left };
        });
        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(width);
        expect(geometry.right - geometry.iconRight).toBeGreaterThanOrEqual(10);
        await picker.click();
        const panel = page.getByRole("listbox");
        await expect(panel).toBeVisible();
        const bounds = await panel.boundingBox();
        expect(bounds).not.toBeNull();
        if (bounds) {
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        }
        await page.keyboard.press("Escape");
        await expect(picker).toBeFocused();
      }
      await page
        .locator(".filters")
        .screenshot({
          path: `artifacts/appearance/selects-${theme}-${width}.png`,
        });
      await page.goto("/intake");
      const role = page.getByRole("combobox", { name: "Role", exact: true });
      await role.click();
      await page
        .getByRole("option", { name: "Node.js Developer", exact: true })
        .click();
      await expect(role).toHaveAttribute("data-value", "Node.js Developer");
      await page.goto("/candidates");
      await page
        .getByRole("button", { name: "View Avery Morgan", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Edit details", exact: true })
        .click();
      const dialog = page.getByRole("dialog"),
        editRole = dialog.getByRole("combobox", { name: "Role", exact: true });
      await editRole.click();
      await page
        .getByRole("option", { name: "FULL Stack Developer", exact: true })
        .click();
      await expect(editRole).toBeFocused();
      await page
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      await expect(
        dialog.getByText("FULL Stack Developer", { exact: true }),
      ).toBeVisible();
    }
  }
});
