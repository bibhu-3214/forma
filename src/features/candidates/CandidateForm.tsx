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
}: {
  demo?: boolean;
  initial?: CandidateInput;
  onSave: (input: CandidateInput) => Promise<void>;
  pending: boolean;
  onCancel?: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <form
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
        await onSave(parsed.data);
      }}
    >
      <div className="form-grid">
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
              defaultValue={initial?.[field.name]}
              min={field.type === "number" ? 0 : undefined}
              max={field.type === "number" ? 50 : undefined}
              step={field.type === "number" ? "0.5" : undefined}
              required
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
            {errors[field.name] && (
              <small className="field-error" id={`${field.name}-error`}>
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
          defaultValue={initial?.jobTitle ?? roles[0]}
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
          defaultValue={initial?.skills}
          rows={3}
          required
          aria-invalid={!!errors.skills}
          aria-describedby={errors.skills ? "skills-error" : undefined}
        />
        {errors.skills && (
          <small id="skills-error" className="field-error">
            {errors.skills}
          </small>
        )}
        <small>
          {demo
            ? "Separate skills with commas. Use fictional information only."
            : "Separate skills with commas."}
        </small>
      </label>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="field-error">
          Please check the highlighted fields.
        </p>
      )}
      <div className="form-footer">
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="primary" disabled={pending} type="submit">
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
    </form>
  );
}
