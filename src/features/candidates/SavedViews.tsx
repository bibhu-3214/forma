import { useState } from "react";
import { Button, Input, Modal } from "../../platform/ui";
import {
  savedViewsSchema,
  viewParams,
  type SavedView,
} from "./viewPreferences";
import type { Filters } from "./model";
export default function SavedViews({
  owner,
  filters,
  onApply,
}: {
  owner: string;
  filters: Filters;
  onApply: (params: URLSearchParams) => void;
}) {
  const key = "forma.saved-views.v1." + owner;
  const [loaded] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw && raw.length > 30_000) throw new Error("Too large");
      return {
        views: raw ? savedViewsSchema.parse(JSON.parse(raw) as unknown) : [],
        blocked: false,
      };
    } catch {
      return { views: [], blocked: true };
    }
  });
  const [views, setViews] = useState<SavedView[]>(loaded.views),
    [name, setName] = useState(""),
    [error, setError] = useState(""),
    [remove, setRemove] = useState<SavedView | null>(null);
  function persist(next: unknown) {
    try {
      const valid = savedViewsSchema.parse(next);
      localStorage.setItem(key, JSON.stringify(valid));
      setViews(valid);
      setError("");
      return true;
    } catch {
      setError(
        "Could not save this view. Use a unique name of up to 50 characters and keep at most 12 views. Browser storage must be available.",
      );
      return false;
    }
  }
  return (
    <section
      aria-label="Saved candidate views"
      className="mx-4 mb-5 rounded-xl border border-line bg-soft/60 p-4 sm:mx-5"
    >
      <p className="text-sm font-semibold">Your saved views</p>
      <p className="mt-1 text-xs text-muted">
        Filters saved in this browser for your account.
      </p>
      {loaded.blocked && (
        <p role="alert" className="mt-3 text-xs text-danger">
          Saved views could not be read. Existing browser data was kept; these
          controls are unavailable until storage is readable.
        </p>
      )}
      <div className="my-3 flex flex-wrap gap-2">
        {views.map((view) => (
          <div
            key={view.id}
            className="flex max-w-full overflow-hidden rounded-xl border border-line bg-surface"
          >
            <Button
              tone="quiet"
              onClick={() => onApply(viewParams(view.filters))}
            >
              <span className="max-w-52 truncate">{view.name}</span>
            </Button>
            <Button
              tone="quiet"
              aria-label={"Delete saved view " + view.name}
              onClick={() => setRemove(view)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const { query, role, status, sort } = filters;
          if (
            persist([
              ...views,
              {
                id: crypto.randomUUID(),
                name: name.trim(),
                filters: {
                  query,
                  role,
                  status,
                  sort:
                    sort === "oldest" ||
                    sort === "name" ||
                    sort === "experience"
                      ? sort
                      : "newest",
                },
              },
            ])
          )
            setName("");
        }}
      >
        <Input
          aria-label="Saved view name"
          className="min-w-40 flex-1"
          placeholder="e.g. Shortlisted engineers"
          value={name}
          maxLength={50}
          required
          onChange={(event) => setName(event.target.value)}
          disabled={loaded.blocked}
        />
        <Button
          type="submit"
          disabled={loaded.blocked || views.length >= 12 || !name.trim()}
        >
          Save this view
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      )}
      <Modal
        open={Boolean(remove)}
        title="Delete saved view?"
        onClose={() => setRemove(null)}
      >
        <p className="text-sm text-muted">
          This removes {remove?.name} from this browser. Candidate records are
          kept.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button tone="quiet" onClick={() => setRemove(null)}>
            Keep view
          </Button>
          <Button
            tone="danger"
            onClick={() => {
              if (persist(views.filter((view) => view.id !== remove?.id)))
                setRemove(null);
            }}
          >
            Delete view
          </Button>
        </div>
      </Modal>
    </section>
  );
}
