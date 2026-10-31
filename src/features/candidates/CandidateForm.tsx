import DraftNotice from "../../platform/DraftNotice";
import { useTabDraft, useBeforeUnload } from "../../platform/useTabDraft";
import SelectControl from "../../components/SelectControl";
import { useState } from "react";
import { ArrowRight, Save } from "lucide-react";
import { inputSchema, roles, type CandidateInput } from "./model";
export default function CandidateForm({
  initial,
  onSave,
  pending,
  onCancel,
  demo = true,
  draftOwner,
  draftId = "new",
}: {
  demo?: boolean;
  draftOwner: string;
  draftId?: string;
  initial?: CandidateInput;
  onSave: (input: CandidateInput) => Promise<boolean>;
  pending: boolean;
  onCancel?: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const drafts = useTabDraft(
    draftOwner + ":" + draftId,
    ["name", "email", "phone", "experience", "skills", "jobTitle"],
    ["candidate"],
  );
  const [recovered, setRecovered] = useState<Record<string, string> | null>(
    null,
  );
  const [dirty, setDirty] = useState(false);
  useBeforeUnload(dirty);
  return (
    <form
      key={recovered ? "recovered" : "initial"}
      onChange={(event) => {
        setDirty(true);
        const form = event.currentTarget;
        queueMicrotask(() =>
          drafts.capture(form, {
            kind: "candidate",
            base: JSON.stringify(initial || {}),
          }),
        );
      }}
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const parsed = inputSchema.safeParse({
          ...Object.fromEntries(data),
          experience:
            data.get("experience") === ""
              ? NaN
              : Number(data.get("experience")),
        });
        if (!parsed.success) {
          setErrors(
            Object.fromEntries(
              parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
            ),
          );
          return;
        }
        setErrors({});
        if (await onSave(parsed.data)) {
          drafts.clear();
          setDirty(false);
        }
      }}
      className="[&_label]:flex [&_label]:flex-col [&_label]:gap-2 [&_label]:text-[12px] [&_label]:font-[550] [&_label]:mb-[22px] [&_small]:font-normal"
    >
      {drafts.draft && !dirty && !recovered && (
        <DraftNotice
          onRestore={() => {
            if (drafts.draft?.base !== JSON.stringify(initial || {})) {
              setErrors({
                draft:
                  "This candidate changed since the draft was started. Copy any text you need from View draft text, then discard the older draft before editing the current record.",
              });
              return;
            }
            setRecovered(drafts.draft.values);
            setDirty(true);
          }}
          onDiscard={drafts.clear}
        >
          <p>Kept in this tab for up to 24 hours. Review it before saving.</p>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium text-primary">
              View draft text
            </summary>
            <dl className="mt-3 grid gap-2 text-xs">
              {Object.entries(drafts.draft.values).map(([name, value]) => (
                <div key={name} className="min-w-0">
                  <dt className="font-semibold">{name}</dt>
                  <dd className="whitespace-pre-wrap break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        </DraftNotice>
      )}
      {drafts.storageError && (
        <p role="status" className="text-sm text-danger">
          {drafts.storageError}
        </p>
      )}
      {errors.draft && (
        <p role="alert" className="text-sm text-danger">
          {errors.draft}
        </p>
      )}
      <p className="mb-5 text-xs text-muted">
        Unsaved text is kept in this tab until saved, discarded, or signed out.
      </p>
      <fieldset
        disabled={pending || Boolean(drafts.draft && !dirty && !recovered)}
        className="min-w-0 border-0 p-0 m-0"
      >
        <div className="form-grid grid grid-cols-[1fr_1fr] gap-[0_20px] [@media(max-width:_760px)]:grid-cols-[1fr]">
          {(
            [
              {
                name: "name",
                label: "Full name",
                placeholder: "e.g. Morgan Ellis",
                type: "text",
              },
              {
                name: "email",
                label: "Email address",
                placeholder: "morgan@example.com",
                type: "email",
              },
              {
                name: "phone",
                label: "Phone number",
                placeholder: "+1 202 555 0100",
                type: "tel",
              },
              {
                name: "experience",
                label: "Years of experience",
                placeholder: "0",
                type: "number",
              },
            ] as const
          ).map((field) => (
            <label key={field.name}>
              {field.label}
              <input
                aria-label={field.label}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                defaultValue={recovered?.[field.name] ?? initial?.[field.name]}
                min={field.type === "number" ? 0 : undefined}
                max={field.type === "number" ? 50 : undefined}
                step={field.type === "number" ? "0.5" : undefined}
                required
                aria-invalid={!!errors[field.name]}
                aria-describedby={
                  errors[field.name] ? `${field.name}-error` : undefined
                }
                className='[font:inherit] [-webkit-tap-highlight-color:transparent] [border:1px_solid_var(--line)] [background:var(--surface)] rounded-[7px] p-[11px_12px] text-ink w-full [&::placeholder]:text-muted [&[aria-invalid="true"]]:border-danger [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)]'
              />
              {errors[field.name] && (
                <small
                  className="field-error block text-[12px] text-danger"
                  id={`${field.name}-error`}
                >
                  {errors[field.name]}
                </small>
              )}
            </label>
          ))}
        </div>
        <label htmlFor="candidate-role">
          Role
          <SelectControl
            id="candidate-role"
            aria-label="Role"
            name="jobTitle"
            defaultValue={recovered?.jobTitle ?? initial?.jobTitle ?? roles[0]}
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </SelectControl>
        </label>
        <label>
          Skills
          <textarea
            aria-label="Skills"
            name="skills"
            placeholder="e.g. React, TypeScript, accessible interfaces"
            defaultValue={recovered?.skills ?? initial?.skills}
            rows={3}
            required
            aria-invalid={!!errors.skills}
            aria-describedby={errors.skills ? "skills-error" : undefined}
            className='[font:inherit] [-webkit-tap-highlight-color:transparent] [border:1px_solid_var(--line)] [background:var(--surface)] rounded-[7px] p-[11px_12px] text-ink w-full [&::placeholder]:text-muted [&[aria-invalid="true"]]:border-danger [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)]'
          />
          {errors.skills && (
            <small
              id="skills-error"
              className="field-error block text-[12px] text-danger"
            >
              {errors.skills}
            </small>
          )}
          <small className="block text-muted text-[12px]">
            {demo
              ? "Separate skills with commas. Use fictional information only."
              : "Separate skills with commas."}
          </small>
        </label>
        {Object.keys(errors).some((field) => field !== "draft") && (
          <p
            role="alert"
            className="field-error mt-0 leading-[1.7] text-danger"
          >
            Please check the highlighted fields.
          </p>
        )}
        <div className="form-footer [border-top:1px_solid_var(--line)] pt-[22px] flex justify-end gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
            >
              Cancel
            </button>
          )}
          <button
            className='primary [font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [button&]:[background:var(--primary)] [button&]:text-[#ffffff] [button&]:border-primary [button&]:shadow-[0_3px_5px_#5348c31a] [button&:hover]:[background:var(--primary-hover)] [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [[data-theme="dark"]_button&]:text-[#211937] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[button&:hover]:[transform:translateY(-2px)] [@media(prefers-reduced-motion:_no-preference)]:[button&:hover]:shadow-[0_6px_18px_var(--halo)] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]'
            disabled={pending}
            type="submit"
          >
            {initial ? <Save size={17} /> : <ArrowRight size={17} />}{" "}
            {pending
              ? "Saving…"
              : initial
                ? "Save changes"
                : demo
                  ? "Add demo candidate"
                  : "Add candidate"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
