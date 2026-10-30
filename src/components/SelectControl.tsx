import { useId, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import HeadlessSelect from "../platform/SelectControl";
import { controlClass } from "../platform/ui";
type Props = Omit<ComponentPropsWithoutRef<"select">, "multiple" | "size">;
export default function SelectControl({
  value,
  defaultValue,
  onChange,
  ...props
}: Props) {
  const id = useId();
  const [selected, setSelected] = useState(String(defaultValue ?? ""));
  return (
    <span className="select-control">
      <HeadlessSelect
        {...props}
        id={props.id || id}
        value={value ?? selected}
        onChange={(event) => {
          if (value === undefined) setSelected(event.currentTarget.value);
          onChange?.(event);
        }}
        className={
          controlClass +
          " inline-flex items-center justify-between gap-3 " +
          (props.className || "")
        }
      />
    </span>
  );
}
