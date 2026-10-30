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
          className="hover:underline [font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
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
            className='sr-only [font:inherit] [-webkit-tap-highlight-color:transparent] [border:1px_solid_var(--line)] [background:var(--surface)] rounded-[7px] p-0! border-0! text-ink [&::placeholder]:text-muted [&[aria-invalid="true"]]:border-danger absolute w-px h-px overflow-hidden [clip:rect(0,_0,_0,_0)] [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)]'
            onChange={async (event) => {
              const input = event.currentTarget,
                file = input.files?.[0];
              if (!file) return;
              try {
                if (file.size > 1500000)
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
          <p role="alert" className="mt-0 text-muted leading-[1.7]">
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
        <p className="text-sm mt-0 text-muted leading-[1.7]">
          Importing replaces your {state.records.length} saved candidates with{" "}
          {loaded?.length} records from this file. Export a backup before
          continuing.
        </p>
        {error && (
          <p role="alert" className="mt-0 text-muted leading-[1.7]">
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
