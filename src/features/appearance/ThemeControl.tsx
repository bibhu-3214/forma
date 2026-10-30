import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
export const appearanceKey = "forma.appearance.v1";
export type Appearance = "light" | "dark" | "system";
export function parseAppearance(value: string | null | undefined): Appearance {
  return value === "light" || value === "dark" ? value : "system";
}
export function resolveAppearance(preference: Appearance, systemDark: boolean) {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference;
}
export default function ThemeControl() {
  const [preference, setPreference] = useState<Appearance>(() =>
    parseAppearance(document.documentElement.dataset.appearance),
  );
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const theme = resolveAppearance(preference, media.matches);
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.appearance = preference;
      document.documentElement.style.colorScheme = theme;
      document.documentElement.style.backgroundColor =
        theme === "dark" ? "#10121c" : "#f7f8fa";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", theme === "dark" ? "#10121c" : "#f7f8fa");
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === appearanceKey || event.key === null) {
        setPreference(parseAppearance(event.newValue));
        setStorageWarning(false);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function choose(value: Appearance) {
    setPreference(value);
    try {
      localStorage.setItem(appearanceKey, value);
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }
  return (
    <div className="appearance relative">
      <div
        className='theme-switch flex gap-[3px] [background:var(--soft)] [border:1px_solid_var(--line)] p-[3px] rounded-[10px] [&_button]:min-h-8 [&_button]:w-[34px] [&_button]:p-[7px] [&_button]:[border:1px_solid_transparent] [&_button]:rounded-[7px] [&_button]:[background:transparent] [&_button]:text-muted [&_button[aria-pressed="true"]]:[background:var(--surface)] [&_button[aria-pressed="true"]]:text-[var(--accent)] [&_button[aria-pressed="true"]]:border-[var(--accent-line)] [&_button[aria-pressed="true"]]:shadow-[0_2px_5px_#0000000a] [&_button:hover]:text-ink [&_button:hover]:[background:var(--surface)] [&_button:focus-visible]:[outline-offset:3px] [@media(max-width:_760px)]:[&_button]:w-[38px] [@media(max-width:_760px)]:[&_button]:min-h-9'
        role="group"
        aria-label="Appearance"
      >
        {(
          [
            ["light", Sun],
            ["dark", Moon],
            ["system", Monitor],
          ] as const
        ).map(([value, Icon]) => (
          <button
            key={value}
            type="button"
            aria-label={`${value[0].toUpperCase()}${value.slice(1)} theme`}
            aria-pressed={preference === value}
            title={`${value[0].toUpperCase()}${value.slice(1)} theme`}
            onClick={() => choose(value)}
            className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
      {storageWarning && (
        <span
          className="theme-warning absolute right-0 top-[calc(100%_+_8px)] w-[230px] p-2.5 [background:var(--surface)] [border:1px_solid_var(--line)] rounded-lg z-[5] text-ink text-[11px]"
          role="status"
        >
          Theme changed for this visit; storage is unavailable.
        </span>
      )}
    </div>
  );
}
