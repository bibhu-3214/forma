import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import CandidateForm from "../src/features/candidates/CandidateForm";
import { fixtures } from "../src/features/candidates/repository";
it("shows accessible errors without saving an empty form", async () => {
  const save = vi.fn();
  render(<CandidateForm draftOwner="test" pending={false} onSave={save} />);
  fireEvent.click(screen.getByRole("button", { name: "Add demo candidate" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("highlighted");
  expect(screen.getByLabelText("Full name")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(save).not.toHaveBeenCalled();
});
it("saves edited fields as typed input", async () => {
  const save = vi.fn().mockResolvedValue(true);
  render(
    <CandidateForm
      draftOwner="test"
      initial={fixtures[0]}
      pending={false}
      onSave={save}
    />,
  );
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "Updated Demo" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Updated Demo", experience: 5 }),
    ),
  );
});
it("disables saving while pending", () => {
  render(<CandidateForm draftOwner="test" pending onSave={vi.fn()} />);
  expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
});
