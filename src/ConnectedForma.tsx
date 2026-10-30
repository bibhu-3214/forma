import { useState } from "react";
import { z } from "zod";
import ServiceGate from "./platform/ServiceGate";
import type { WorkspaceState } from "./platform/ServiceGate";
import { Button, Modal } from "./platform/ui";
import { message } from "./platform/api";
import App from "./App";
import { candidateSchema } from "./features/candidates/model";
import type { Candidate } from "./features/candidates/model";
const backupSchema = z.object({
  version: z.literal(1),
  product: z.literal("forma"),
  records: z
    .array(candidateSchema)
    .max(10000)
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      "Duplicate candidate IDs.",
    ),
});
function ConnectedCandidates({ state }: { state: WorkspaceState<Candidate> }) {
  const [loaded, setLoaded] = useState<Candidate[] | null>(null),
    [error, setError] = useState("");
  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3 border-b border-line bg-surface px-5 py-2 text-xs text-muted lg:pl-64">
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => {
            const url = URL.createObjectURL(
                new Blob(
                  [
                    JSON.stringify(
                      { version: 1, product: "forma", records: state.records },
                      null,
                      2,
                    ),
                  ],
                  { type: "application/json" },
                ),
              ),
              link = document.createElement("a");
            link.href = url;
            link.download = "forma-candidates.json";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Export candidates
        </button>
        <label className="cursor-pointer font-semibold text-primary hover:underline focus-within:outline-2 focus-within:outline-primary">
          Import candidates
          <input
            type="file"
            aria-label="Import candidates JSON"
            accept=".json,application/json"
            className="sr-only"
            onChange={async (event) => {
              const input = event.currentTarget,
                file = input.files?.[0];
              if (!file) return;
              try {
                if (file.size > 1_500_000)
                  throw new Error("Choose an export under 1.5 MB.");
                const raw: unknown = JSON.parse(await file.text());
                setLoaded(backupSchema.parse(raw).records);
                setError("");
              } catch (error) {
                setError(message(error));
              } finally {
                input.value = "";
              }
            }}
          />
        </label>
        {error && (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}
      </div>
      <App initialCandidates={state.records} onPersist={state.save} />
      <Modal
        busy={state.busy}
        open={loaded !== null}
        title="Replace candidate workspace?"
        onClose={() => setLoaded(null)}
      >
        <p className="text-sm leading-7 text-muted">
          Importing replaces your {state.records.length} saved candidates with{" "}
          {loaded?.length} records from this file. Export a backup before
          continuing.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-danger">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            tone="quiet"
            disabled={state.busy}
            onClick={() => setLoaded(null)}
          >
            Cancel import
          </Button>
          <Button
            disabled={state.busy}
            onClick={async () => {
              if (!loaded) return;
              try {
                await state.save(loaded);
                setLoaded(null);
                state.reload();
              } catch (error) {
                setError(message(error));
              }
            }}
          >
            Replace candidates
          </Button>
        </div>
      </Modal>
    </>
  );
}
export default function ConnectedForma() {
  return (
    <ServiceGate schema={candidateSchema}>
      {(state) => <ConnectedCandidates state={state} />}
    </ServiceGate>
  );
}
