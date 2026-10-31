import { z } from "zod";
import { roles, statuses, type Filters } from "./model";
export const savedViewsSchema = z
  .array(
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(50),
        filters: z
          .object({
            query: z.string().max(120),
            role: z.union([z.literal(""), z.enum(roles)]),
            status: z.union([z.literal(""), z.enum(statuses)]),
            sort: z.enum(["newest", "oldest", "name", "experience"]),
          })
          .strict(),
      })
      .strict(),
  )
  .max(12)
  .refine(
    (views) =>
      new Set(views.map((view) => view.id)).size === views.length &&
      new Set(views.map((view) => view.name.toLowerCase())).size ===
        views.length,
    "Use unique saved view names.",
  );
export type SavedView = z.infer<typeof savedViewsSchema>[number];
export function viewParams(filters: Omit<Filters, "page">) {
  const params = new URLSearchParams();
  for (const [key, value] of [
    ["q", filters.query],
    ["role", filters.role],
    ["status", filters.status],
    ["sort", filters.sort],
  ])
    if (value) params.set(key, value);
  return params;
}
