import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import CandidateForm from "../src/features/candidates/CandidateForm";
import { fixtures } from "../src/features/candidates/repository";
afterEach(() => sessionStorage.clear());
test("an older candidate draft can be copied without overwriting a changed record", () => {
  const save = vi.fn().mockResolvedValue(true);
  sessionStorage.setItem(
    "forma.tab-draft.v1.test:edited",
    JSON.stringify({
      owner: "test:edited",
      kind: "candidate",
      savedAt: Date.now(),
      base: JSON.stringify(fixtures[0]),
      values: { name: "Old draft candidate", skills: "Draft skills" },
    }),
  );
  render(
    <CandidateForm
      draftOwner="test"
      draftId="edited"
      initial={{ ...fixtures[0], name: "Latest candidate" }}
      pending={false}
      onSave={save}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Recover draft" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Copy any text you need");
  expect(screen.getByLabelText("Full name")).toHaveValue("Latest candidate");
  expect(screen.getByLabelText("Full name")).toBeDisabled();
  fireEvent.click(screen.getByText("View draft text"));
  expect(screen.getByText("Old draft candidate")).toBeVisible();
  expect(screen.getByText("Draft skills")).toBeVisible();
  expect(save).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Discard draft" }));
  expect(screen.getByLabelText("Full name")).toHaveValue("Latest candidate");
  expect(screen.getByLabelText("Full name")).toBeEnabled();
});
