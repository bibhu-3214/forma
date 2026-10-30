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
    <span className="select-control block relative min-w-0 w-full [&_select]:[appearance:none] [&_select]:[-webkit-appearance:none] [&_select]:w-full [&_select]:min-w-0 [&_select]:[padding-inline-end:42px] [&_select]:[text-overflow:ellipsis] [&_select]:cursor-pointer [&_>_svg]:absolute [&_>_svg]:[inset-inline-end:14px] [&_>_svg]:top-[50%] [&_>_svg]:[transform:translateY(-50%)] [&_>_svg]:text-muted [&_>_svg]:[pointer-events:none] [@media(forced-colors:_active)]:[&_select]:[appearance:auto] [@media(forced-colors:_active)]:[&_>_svg]:hidden">
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
          "inline-flex items-center justify-between gap-3" +
          (props.className || "")
        }
      />
    </span>
  );
}
