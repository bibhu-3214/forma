import { statuses, transition, type Candidate, type Status } from "./model";
export function bulkTransition(
  records: readonly Candidate[],
  ids: readonly string[],
  status: Status,
): Candidate[] {
  if (
    !statuses.includes(status) ||
    !ids.length ||
    ids.length > 100 ||
    new Set(ids).size !== ids.length
  )
    throw new Error("Choose up to 100 unique candidates and a valid status.");
  const selected = new Set(ids);
  if (
    records.filter((record) => selected.has(record.id)).length !== selected.size
  )
    throw new Error(
      "A selected candidate is unavailable. Refresh the directory.",
    );
  let changes = 0;
  const next = records.map((record) => {
    if (!selected.has(record.id) || record.status === status) return record;
    changes++;
    return transition(record, status);
  });
  if (!changes)
    throw new Error("The selected candidates already have that status.");
  return next;
}
