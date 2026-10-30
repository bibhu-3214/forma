import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const previous = document.activeElement as HTMLElement;
    el.showModal();
    // Keep Tab within the dialog, including after a status action removes its button.
    const containFocus = (event: KeyboardEvent) => {
      if (
        event.key !== "Tab" ||
        event.defaultPrevented ||
        el.querySelector('[role="listbox"]')
      )
        return;
      const controls = Array.from(
        el.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
        ),
      ).filter(
        (control) =>
          control.tabIndex >= 0 &&
          control.getClientRects().length > 0 &&
          control.getAttribute("aria-hidden") !== "true",
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        el.focus();
        return;
      }
      if (
        !el.contains(document.activeElement) ||
        (!event.shiftKey && document.activeElement === last)
      ) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };
    document.addEventListener("keydown", containFocus);
    return () => {
      document.removeEventListener("keydown", containFocus);
      el.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="dialog-title"
      className="[border:1px_solid_var(--line)] rounded-2xl p-[26px] max-w-[600px] w-[calc(100%_-_32px)] max-h-[90dvh] overflow-auto shadow-[0_32px_100px_#00000055] text-ink [background:var(--surface)] m-auto [&::backdrop]:[background:#090b16a8] [&::backdrop]:[backdrop-filter:blur(4px)] [@media(max-width:_760px)]:p-5 [@media(prefers-reduced-motion:_no-preference)]:[&[open]]:animate-[dialog-in_320ms_var(--ease-out)_both] [@media(prefers-reduced-motion:_no-preference)]:[&[open]::backdrop]:animate-[fade-in_220ms_ease_both]"
    >
      <div className="dialog-head flex justify-between items-center mb-[22px] [&_button]:[border:0] [&_button]:p-[5px] [&_button]:min-h-8 [&_h2]:text-[19px] [&_h2]:m-0">
        <h2
          id="dialog-title"
          className="mt-0 text-[17px] tracking-[-0.35px] mb-1 [@media(max-width:_760px)]:text-[16px]"
        >
          {title}
        </h2>
        <button
          aria-label="Close dialog"
          onClick={onClose}
          className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
