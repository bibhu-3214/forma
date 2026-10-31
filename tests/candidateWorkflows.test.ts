import { expect, test } from "vitest";
import { bulkTransition } from "../src/features/candidates/bulk";
import {
  savedViewsSchema,
  viewParams,
} from "../src/features/candidates/viewPreferences";
import { fixtures } from "../src/features/candidates/repository";
import { readFilters } from "../src/features/candidates/model";
test("bulk updates change only selected statuses and preserve candidate identities", () => {
  const before = structuredClone(fixtures);
  const targets = fixtures.slice(0, 2).map((record) => record.id);
  const result = bulkTransition(fixtures, targets, "shortlisted");
  expect(result.slice(0, 2).map((record) => record.status)).toEqual([
    "shortlisted",
    "shortlisted",
  ]);
  expect(result.map((record) => record.id)).toEqual(
    before.map((record) => record.id),
  );
  expect(result.slice(2)).toEqual(before.slice(2));
  expect(fixtures).toEqual(before);
});
test("bulk review refuses vanished or duplicate selections and no-op changes", () => {
  expect(() => bulkTransition(fixtures, ["missing"], "rejected")).toThrow(
    "unavailable",
  );
  expect(() =>
    bulkTransition(fixtures, [fixtures[0].id, fixtures[0].id], "rejected"),
  ).toThrow("unique");
  expect(() =>
    bulkTransition(fixtures, [fixtures[0].id], fixtures[0].status),
  ).toThrow("already");
});
test("saved view filters round trip without stale pagination and reject ambiguous names", () => {
  const view = {
    id: crypto.randomUUID(),
    name: "Engineers",
    filters: {
      query: "react",
      role: "",
      status: "shortlisted" as const,
      sort: "experience" as const,
    },
  };
  expect(readFilters(viewParams(view.filters))).toEqual({
    ...view.filters,
    page: 1,
  });
  expect(savedViewsSchema.parse([view])).toEqual([view]);
  expect(() =>
    savedViewsSchema.parse([
      view,
      { ...view, id: crypto.randomUUID(), name: "engineers" },
    ]),
  ).toThrow();
  expect(() =>
    savedViewsSchema.parse([
      { ...view, filters: { ...view.filters, status: "unknown" } },
    ]),
  ).toThrow();
});
