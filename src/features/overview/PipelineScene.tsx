import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
/** A finite illustration, never a simulation of an actual candidate decision. */
export default function PipelineScene({ onReplay }: { onReplay: () => void }) {
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [playing, setPlaying] = useState(true);
  const [iteration, setIteration] = useState(0);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function replay() {
    setIteration((i) => i + 1);
    setPlaying(true);
    onReplay();
  }
  return (
    <div className="flow-illustration [flex:1] min-w-0 [@media(min-width:_761px)_and_(max-width:_1150px)]:w-full [@media(max-width:_760px)]:mt-7">
      <div className="flow-caption flex items-center justify-between gap-3 text-[9px] tracking-[1.5px] font-[650] text-[var(--accent)] p-[0_12px] [&_span:last-child]:opacity-[0.7] [&_span:last-child]:[font-variant-numeric:tabular-nums] [@media(max-width:_760px)]:text-[8px] [@media(max-width:_760px)]:p-0">
        <span>THE CANDIDATE JOURNEY</span>
        <span>01 — 03</span>
      </div>
      <div
        key={iteration}
        className={
          `flow-scene ${playing && !reduced ? "is-playing [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-inbox]:animate-[dossier-enter_800ms_var(--ease-out)_both] [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-review]:animate-[dossier-enter_800ms_160ms_var(--ease-out)_both] [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-destination]:animate-[dossier-enter_800ms_320ms_var(--ease-out)_both] [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-signal]:animate-[signal-trace_3400ms_600ms_ease_both] [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-packet]:animate-[profile-journey_4000ms_550ms_cubic-bezier(0.4,_0,_0.2,_1)_both] [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-review-ring]:animate-[review-turn_1600ms_1300ms_ease-in-out_both] [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-review-line]:animate-[review-read_1000ms_1700ms_ease_both] [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-check]:animate-[decision-draw_600ms_3400ms_ease_both] [@media(prefers-reduced-motion:_no-preference)]:[&_.flow-arrival]:animate-[arrival-ring_1000ms_3500ms_ease-out_both]" : "is-still"}` +
          " flow-scene [&_svg]:block [&_svg]:w-full [&_svg]:h-auto [&_svg]:overflow-visible [@media(max-width:_760px)]:m-[10px_-8px] [@media(prefers-reduced-motion:_no-preference)]:[&.is-playing]:animate-[scene-clock_4800ms_linear]"
        }
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.animationName === "scene-clock"
          )
            setPlaying(false);
        }}
      >
        <svg
          viewBox="0 0 650 270"
          role="img"
          aria-labelledby="flow-title flow-description"
          className="shrink-0"
        >
          <title id="flow-title">
            From application to a considered next step
          </title>
          <desc id="flow-description">
            An illustrative profile moves from received applications through
            human review to a shortlist. No candidate records are changed.
          </desc>
          <defs>
            <linearGradient id="flow-line">
              <stop stopColor="var(--accent)" />
              <stop offset="1" stopColor="var(--success)" />
            </linearGradient>
          </defs>
          <path
            className="flow-track stroke-[var(--accent-line)] [stroke-width:2] [stroke-dasharray:3_6]"
            d="M158 145H491"
          />
          <path
            className="flow-signal stroke-[url(#flow-line)] [stroke-width:2] [stroke-dasharray:333] [stroke-dashoffset:0]"
            d="M158 145H491"
          />
          <g className="flow-node flow-inbox">
            <rect
              className="flow-card ghost fill-surface stroke-[var(--accent-line)] [stroke-width:1] [&.ghost]:fill-[var(--accent-wash)] [&.ghost]:opacity-[0.65]"
              x="32"
              y="66"
              width="142"
              height="154"
              rx="16"
              transform="rotate(-8 103 143)"
            />
            <rect
              className="flow-card fill-surface stroke-[var(--accent-line)] [stroke-width:1] [&.ghost]:fill-[var(--accent-wash)] [&.ghost]:opacity-[0.65]"
              x="36"
              y="62"
              width="142"
              height="154"
              rx="16"
            />
            <text
              className="flow-number fill-muted text-[8px] tracking-[0.8px] font-semibold [@media(max-width:_760px)]:hidden"
              x="53"
              y="88"
            >
              01 / RECEIVED
            </text>
            <circle
              className="flow-avatar fill-[var(--accent-soft)]"
              cx="69"
              cy="119"
              r="15"
            />
            <path
              className="flow-icon fill-[none] stroke-[var(--accent)] [stroke-width:1.8] [stroke-linecap:round]"
              d="M64 115a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M60 129q9-10 18 0"
            />
            <rect
              className="flow-text-line fill-[var(--accent-line)] [&.secondary]:opacity-[0.6]"
              x="94"
              y="111"
              width="60"
              height="5"
              rx="2"
            />
            <rect
              className="flow-text-line secondary fill-[var(--accent-line)] [&.secondary]:opacity-[0.6]"
              x="94"
              y="122"
              width="40"
              height="4"
              rx="2"
            />
            <path
              className="flow-rule fill-[none] stroke-line"
              d="M53 148H159"
            />
            <text
              className="flow-label fill-ink text-[11px] font-[650] tracking-[-0.2px] [@media(max-width:_760px)]:hidden"
              x="53"
              y="177"
            >
              A new possibility.
            </text>
            <text
              className="flow-small fill-muted text-[8px] [@media(max-width:_760px)]:hidden"
              x="53"
              y="195"
            >
              Every profile matters
            </text>
          </g>
          <g className="flow-node flow-review">
            <rect
              className="flow-card fill-surface stroke-[var(--accent-line)] [stroke-width:1] [&.ghost]:fill-[var(--accent-wash)] [&.ghost]:opacity-[0.65]"
              x="249"
              y="45"
              width="152"
              height="188"
              rx="18"
            />
            <text
              className="flow-number fill-muted text-[8px] tracking-[0.8px] font-semibold [@media(max-width:_760px)]:hidden"
              x="267"
              y="73"
            >
              02 / HUMAN REVIEW
            </text>
            <circle
              className="flow-review-ring fill-[none] stroke-[var(--accent)] [stroke-dasharray:4_6] opacity-[0.6] [transform-origin:325px_120px]"
              cx="325"
              cy="120"
              r="31"
            />
            <circle
              className="flow-avatar fill-[var(--accent-soft)]"
              cx="325"
              cy="120"
              r="23"
            />
            <path
              className="flow-icon fill-[none] stroke-[var(--accent)] [stroke-width:1.8] [stroke-linecap:round]"
              d="M319 114a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M313 133q12-16 24 0"
            />
            <text
              className="flow-label fill-ink text-[11px] font-[650] tracking-[-0.2px] [@media(max-width:_760px)]:hidden"
              x="267"
              y="176"
            >
              Look a little closer.
            </text>
            <text
              className="flow-small fill-muted text-[8px] [@media(max-width:_760px)]:hidden"
              x="267"
              y="195"
            >
              People make the call
            </text>
            <path
              className="flow-review-line stroke-[var(--accent)] [stroke-width:2] [stroke-linecap:round] [stroke-dasharray:116]"
              d="M267 212H383"
            />
          </g>
          <g className="flow-node flow-destination">
            <rect
              className="flow-card fill-surface stroke-[var(--accent-line)] [stroke-width:1] [&.ghost]:fill-[var(--accent-wash)] [&.ghost]:opacity-[0.65]"
              x="473"
              y="62"
              width="142"
              height="154"
              rx="16"
            />
            <text
              className="flow-number fill-muted text-[8px] tracking-[0.8px] font-semibold [@media(max-width:_760px)]:hidden"
              x="490"
              y="88"
            >
              03 / NEXT STEP
            </text>
            <circle
              className="flow-success-circle fill-[var(--success-soft)]"
              cx="544"
              cy="122"
              r="21"
            />
            <path
              className="flow-check fill-[none] stroke-[var(--success)] [stroke-width:2.5] [stroke-linecap:round] [stroke-linejoin:round] [stroke-dasharray:30]"
              d="m534 122 7 7 13-14"
            />
            <text
              className="flow-label fill-ink text-[11px] font-[650] tracking-[-0.2px] [@media(max-width:_760px)]:hidden"
              x="490"
              y="177"
            >
              Potential, noticed.
            </text>
            <text
              className="flow-small fill-muted text-[8px] [@media(max-width:_760px)]:hidden"
              x="490"
              y="195"
            >
              A thoughtful shortlist
            </text>
          </g>
          <g
            className="flow-packet opacity-[0] [&_rect]:fill-primary [&_rect]:stroke-surface [&_rect]:[stroke-width:2] [&_path]:fill-[none] [&_path]:stroke-canvas [&_path]:[stroke-width:1.5]"
            aria-hidden="true"
          >
            <rect x="-12" y="-15" width="24" height="30" rx="6" />
            <path d="M-6-5H6M-6 1H6M-6 7H2" />
          </g>
          <circle
            className="flow-arrival opacity-[0] fill-[none] stroke-[var(--success)] [transform-origin:544px_122px]"
            cx="544"
            cy="122"
            r="30"
            aria-hidden="true"
          />
        </svg>
      </div>
      <div
        className="flow-mobile-labels hidden [@media(max-width:_760px)]:grid [@media(max-width:_760px)]:grid-cols-[repeat(3,_1fr)] [@media(max-width:_760px)]:gap-[5px] [@media(max-width:_760px)]:text-center [@media(max-width:_760px)]:text-ink [@media(max-width:_760px)]:text-[10px] [@media(max-width:_760px)]:m-[-10px_0_22px]"
        aria-hidden="true"
      >
        <span>01 · Received</span>
        <span>02 · Human review</span>
        <span>03 · Next step</span>
      </div>
      <div className="flow-controls flex items-center justify-between gap-3 p-[0_10px] text-[9px] text-muted [&_button]:text-[10px] [&_button]:min-h-8 [&_button]:p-[6px_10px] [&_button]:[background:var(--surface)] [@media(max-width:_760px)]:items-start [@media(max-width:_760px)]:p-0 [@media(max-width:_760px)]:text-[9px] [@media(max-width:_760px)]:[&_>_span]:max-w-[165px] [@media(max-width:_760px)]:[&_button]:min-h-9">
        <span>
          {reduced
            ? "Reduced motion · static illustration"
            : "Illustrative flow · no records change"}
        </span>
        <button
          type="button"
          disabled={reduced}
          onClick={playing ? () => setPlaying(false) : replay}
          className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
        >
          {playing && !reduced ? (
            <Pause size={14} />
          ) : iteration ? (
            <RotateCcw size={14} />
          ) : (
            <Play size={14} />
          )}
          {reduced ? "Motion off" : playing ? "Stop motion" : "Replay journey"}
        </button>
      </div>
    </div>
  );
}
