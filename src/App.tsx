import PipelineScene from "./features/overview/PipelineScene";
import ThemeControl from "./features/appearance/ThemeControl";
import Modal from "./components/Modal";
import CandidateList from "./features/candidates/CandidateList";
import { formatDate as date } from "./lib/format";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  LayoutDashboard,
  Plus,
  Sparkles,
  Users,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  roles,
  statusLabel,
  statuses,
  type Candidate,
} from "./features/candidates/model";
import {
  changeStatus,
  createCandidate,
  fixtures,
  LocalCandidateRepository,
} from "./features/candidates/repository";
import CandidateForm from "./features/candidates/CandidateForm";
const repository = new LocalCandidateRepository({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
});
export default function App({
  initialCandidates,
  onPersist,
}: {
  initialCandidates?: Candidate[];
  onPersist?: (records: Candidate[]) => Promise<void>;
} = {}) {
  const connected = Boolean(onPersist);
  const [loaded] = useState(() =>
    initialCandidates !== undefined
      ? { candidates: initialCandidates, warning: "" }
      : repository.load(),
  );
  const [records, setRecords] = useState(loaded.candidates);
  const [warning, setWarning] = useState(loaded.warning);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [reset, setReset] = useState(false);
  const [motionReplay, setMotionReplay] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const title =
      location.pathname === "/intake"
        ? "Candidate intake"
        : location.pathname === "/candidates"
          ? "Candidates"
          : "Overview";
    document.title = `${title} · Forma`;
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);
  const candidate = records.find((c) => c.id === selected);
  const intake = location.pathname === "/intake";
  const overview = location.pathname === "/";
  async function persist(
    next: Candidate[],
    message: string,
    onSuccess?: () => void,
  ) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      if (warning && !reset)
        throw new Error(
          "Reset demo data before saving to recover the unreadable storage.",
        );
      if (onPersist) await onPersist(next);
      else await repository.save(next);
      setRecords(next);
      setNotice(message);
      onSuccess?.();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  if (location.pathname === "/home") return <Navigate to="/" replace />;
  if (location.pathname === "/register")
    return <Navigate to="/intake" replace />;
  if (location.pathname.startsWith("/dashboard")) {
    const map: Record<string, string> = {
      frontend: roles[0],
      nodejs: roles[1],
      meanstack: roles[2],
      fullstack: roles[3],
    };
    const role = map[location.pathname.split("/")[2]];
    return (
      <Navigate
        to={`/candidates${role ? `?role=${encodeURIComponent(role)}` : ""}`}
        replace
      />
    );
  }
  if (!["/", "/intake", "/candidates"].includes(location.pathname))
    return <Navigate to="/" replace />;
  const counts = Object.fromEntries(
    statuses.map((s) => [s, records.filter((c) => c.status === s).length]),
  );
  return (
    <div
      className={
        connected
          ? "app connected-app [&_.sidebar]:top-14 [&_.sidebar]:h-[calc(100dvh-56px)] max-[760px]:[&_.sidebar]:top-auto max-[760px]:[&_.sidebar]:h-auto"
          : "app"
      }
    >
      <a
        className="skip [-webkit-tap-highlight-color:transparent] text-inherit no-underline fixed top-[-100px] left-2.5 z-[80] [background:var(--surface)] p-2.5 [&:focus]:top-2.5 [&:focus-visible]:[outline-offset:3px]"
        href="#main"
      >
        Skip to content
      </a>
      <aside
        aria-label="Workspace sidebar"
        className="sidebar w-[238px] fixed [inset:0_auto_0_0] [background:var(--surface)] [border-right:1px_solid_var(--line)] flex flex-col p-[30px_20px_18px] overflow-y-auto z-[2] [@media(max-width:_1150px)]:w-[205px] [@media(max-width:_1150px)]:p-[25px_14px] [@media(max-width:_760px)]:static [@media(max-width:_760px)]:w-auto [@media(max-width:_760px)]:p-4 [@media(max-width:_760px)]:[border-right:0] [@media(max-width:_760px)]:[border-bottom:1px_solid_var(--line)] [@media(max-width:_760px)]:block"
      >
        <Link
          to="/"
          className="brand text-[31px] tracking-[-1.8px] font-[750] flex items-center p-[0_12px] gap-[9px] [@media(max-width:_760px)]:text-[27px] [@media(max-width:_760px)]:p-0"
        >
          <span className="brand-symbol flex items-center justify-center w-[33px] h-[35px] [background:#6653cf] text-[#ffffff] rounded-[10px_10px_10px_3px] [font-family:Georgia,_serif] [font-style:italic] text-[31px] leading-[1] [@media(max-width:_760px)]:h-[29px] [@media(max-width:_760px)]:w-7 [@media(max-width:_760px)]:text-[27px]">
            f
          </span>
          forma
          <span className="brand-dot text-primary ml-[-10px]">.</span>
        </Link>
        <div className="workspace [border:1px_solid_var(--line)] rounded-[10px] flex items-center gap-2.5 m-[34px_0_30px] p-[12px_9px] [&_strong]:text-[12px] [&_small]:text-[10px] [&_small]:mt-0.5 [@media(max-width:_760px)]:hidden">
          <span className="workspace-icon p-2 [background:var(--accent-soft)] rounded-[7px] text-[var(--accent)]">
            <BriefcaseBusiness size={19} />
          </span>
          <div>
            <strong>Talent workspace</strong>
            <small className="block text-muted text-[12px]">
              {connected ? "Account workspace" : "Demo workspace"}
            </small>
          </div>
          <span className="workspace-dot w-1.5 h-1.5 [background:var(--accent)] rounded-[100%] ml-auto" />
        </div>
        <div className="nav-label text-[10px] font-bold tracking-[1.5px] text-muted pl-3.5 mb-[13px] [@media(max-width:_760px)]:hidden">
          WORKSPACE
        </div>
        <nav className="grid gap-[7px] [&_a]:flex [&_a]:items-center [&_a]:gap-3 [&_a]:p-[12px_14px] [&_a]:text-muted [&_a]:text-[13px] [&_a]:font-[550] [&_a]:rounded-lg [&_a:hover]:[background:var(--accent-soft)] [@media(max-width:_760px)]:flex [@media(max-width:_760px)]:mt-[18px] [@media(max-width:_760px)]:gap-[5px] [@media(max-width:_760px)]:[&_a]:text-[11px] [@media(max-width:_760px)]:[&_a]:gap-[7px] [@media(max-width:_760px)]:[&_a]:p-[9px_10px] [@media(max-width:_760px)]:[&_a]:[flex:1] [@media(max-width:_760px)]:[&_a]:justify-center [@media(max-width:_760px)]:[&_a_svg]:w-4 [@media(prefers-reduced-motion:_no-preference)]:[&_a]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)]">
          <NavLink to="/" end>
            <LayoutDashboard size={19} />
            Overview
          </NavLink>
          <NavLink to="/candidates">
            <Users size={19} />
            Candidates
            <span className="nav-count ml-auto text-[10px] [background:var(--accent-wash)] rounded-[5px] p-[1px_6px] [@media(max-width:_760px)]:hidden">
              {records.length}
            </span>
          </NavLink>
          <NavLink to="/intake">
            <Plus size={19} />
            Candidate intake
          </NavLink>
        </nav>
        <div className="sidebar-bottom mt-auto pt-[25px] [@media(max-width:_760px)]:hidden">
          {!connected && (
            <div className="demo-card [background:var(--soft)] [border:1px_solid_var(--line)] rounded-[10px] p-[16px_13px] text-[var(--accent)] [&_>_strong]:block [&_>_strong]:text-[12px] [&_>_strong]:text-ink [&_>_strong]:mt-2.5 [&_p]:text-[11px] [&_p]:m-[7px_0_12px] [&_button]:text-[10px] [&_button]:[background:none] [&_button]:[border:none] [&_button]:p-0 [&_button]:min-h-[26px] [&_button]:text-muted">
              <ShieldCheck size={22} />
              <strong>Made for exploring</strong>
              <p className="mt-0 text-muted leading-[1.7]">
                Fictional candidates. Local data.
                <br />
                No application reaches an employer.
              </p>
              <button
                onClick={() => {
                  setError("");
                  setReset(true);
                }}
                className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
              >
                <RotateCcw size={14} />
                Reset demo data
              </button>
            </div>
          )}
          <div className="profile flex gap-2.5 items-center [border-top:1px_solid_var(--line)] mt-5 p-[20px_5px_0] [&_strong]:text-[12px] [&_small]:text-[10px]">
            <span className="avatar grid [place-items:center] [background:var(--accent-soft)] text-[var(--accent)] rounded-[50%] h-[35px] w-[35px] text-[10px] shrink-0">
              TW
            </span>
            <div>
              <strong>Talent team</strong>
              <small className="block text-muted text-[12px]">
                {connected
                  ? "Private candidate workspace"
                  : "Local demo workspace"}
              </small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell ml-[238px] [background:radial-gradient(ellipse_at_85%_0,_var(--halo),_transparent_42%)] min-h-[100dvh] [@media(max-width:_1150px)]:ml-[205px] [@media(max-width:_760px)]:m-0">
        <header className="topbar h-[78px] [border-bottom:1px_solid_var(--line)] [background:var(--surface)] flex justify-between items-center p-[0_38px] text-[12px] text-muted [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[13px] [&_strong]:font-medium [&_strong]:text-ink [@media(max-width:_1150px)]:p-[0_24px] [@media(max-width:_760px)]:h-auto [@media(max-width:_760px)]:p-[12px_18px] [@media(max-width:_760px)]:text-[10px] [@media(max-width:_760px)]:min-h-[94px] [@media(max-width:_760px)]:flex-wrap [@media(max-width:_760px)]:gap-2.5">
          <div>
            Workspace <ChevronRight size={14} />
            <strong>
              {intake
                ? "Candidate intake"
                : overview
                  ? "Overview"
                  : "Candidates"}
            </strong>
          </div>
          <div className="topbar-actions gap-4 [@media(max-width:_760px)]:w-full [@media(max-width:_760px)]:justify-between [@media(max-width:_760px)]:flex-row-reverse">
            <ThemeControl />
            <span className="demo-label [&_i]:w-1.5 [&_i]:h-1.5 [&_i]:[background:var(--accent)] [&_i]:rounded-[100%] flex items-center gap-[7px] [border:1px_solid_var(--accent-line)] rounded-md [background:var(--accent-soft)] text-[var(--accent)] p-[5px_9px] text-[10px] font-semibold">
              <i />
              {connected ? "Account workspace" : "Demo workspace"}
            </span>
          </div>
        </header>
        <main
          id="main"
          ref={main}
          tabIndex={-1}
          key={location.pathname}
          className="max-w-[1550px] m-auto p-[38px] [@media(max-width:_1150px)]:p-[28px_24px] [@media(max-width:_760px)]:p-[27px_18px]"
        >
          <div className="page-heading flex justify-between items-center gap-5 mb-7 [&_p]:text-[13px] [&_p]:m-0 [&_.button]:text-[12px] [@media(max-width:_760px)]:block [@media(max-width:_760px)]:mb-6 [@media(max-width:_760px)]:[&_.button]:mt-[18px] [@media(max-width:_760px)]:[&_p]:text-[12px] [@media(prefers-reduced-motion:_no-preference)]:[main_>_&]:animate-[rise-in_520ms_var(--ease-out)_both]">
            <div>
              <div className="eyebrow text-[9px] font-[750] tracking-[1.8px] text-muted mb-[11px] [@media(max-width:_760px)]:text-[8px]">
                YOUR NEXT GREAT TEAM STARTS HERE
              </div>
              <h1 className="mt-0 text-[32px] tracking-[-1.2px] leading-[1.25] font-[650] mb-2.5 [@media(max-width:_1150px)]:text-[28px] [@media(max-width:_760px)]:text-[28px] [@media(max-width:_760px)]:max-w-[370px]">
                {intake
                  ? "Make room for new talent."
                  : overview
                    ? "A little clarity. A lot of potential."
                    : "Good people, all in one place."}
              </h1>
              <p className="mt-0 text-muted leading-[1.7]">
                {intake
                  ? connected
                    ? "Add a candidate to your private hiring pipeline."
                    : "Add a fictional candidate to explore the complete hiring workflow."
                  : overview
                    ? "Keep your pipeline moving and your next hire in focus."
                    : "Explore applications, review details and take the next step."}
              </p>
            </div>
            {!intake && (
              <Link
                className='button primary inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [button&]:[background:var(--primary)] [button&]:text-[#ffffff] [button&]:border-primary [button&]:shadow-[0_3px_5px_#5348c31a] [&.primary]:[background:var(--primary)] [&.primary]:text-[#ffffff] [&.primary]:border-primary [&.primary]:shadow-[0_3px_5px_#5348c31a] [button&:hover]:[background:var(--primary-hover)] [&.primary:hover]:[background:var(--primary-hover)] [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [[data-theme="dark"]_button&]:text-[#211937] [[data-theme="dark"]_&.primary]:text-[#211937] [@media(prefers-reduced-motion:_no-preference)]:[&:hover]:[transform:translateY(-2px)] [@media(prefers-reduced-motion:_no-preference)]:[&:hover]:shadow-[0_6px_18px_var(--halo)] [@media(prefers-reduced-motion:_no-preference)]:[button&:hover]:[transform:translateY(-2px)] [@media(prefers-reduced-motion:_no-preference)]:[button&:hover]:shadow-[0_6px_18px_var(--halo)] [@media(prefers-reduced-motion:_no-preference)]:[&:active]:[transform:translateY(0)_scale(0.98)]'
                to="/intake"
              >
                <Plus size={18} />
                Add candidate
              </Link>
            )}
          </div>
          {warning && (
            <div
              className="alert p-[12px_16px] mb-[18px] rounded-lg text-[12px] [background:var(--danger-soft)] text-danger [border:1px_solid_var(--danger-line)] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_320ms_var(--ease-out)_both]"
              role="alert"
            >
              {warning}
            </div>
          )}
          {!candidate && !reset && error && (
            <div
              className="alert p-[12px_16px] mb-[18px] rounded-lg text-[12px] [background:var(--danger-soft)] text-danger [border:1px_solid_var(--danger-line)] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_320ms_var(--ease-out)_both]"
              role="alert"
            >
              {error}
            </div>
          )}
          <div
            role="status"
            className={
              notice
                ? "notice p-[12px_16px] mb-[18px] rounded-lg text-[12px] [background:var(--success-soft)] text-[var(--success)] [border:1px_solid_var(--success-line)] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_320ms_var(--ease-out)_both]"
                : ""
            }
          >
            {notice}
          </div>
          {intake ? (
            <div className="intake-grid grid grid-cols-[1.7fr_1fr] gap-7 [align-items:start] [@media(max-width:_760px)]:grid-cols-[1fr] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_650ms_90ms_var(--ease-out)_both]">
              <section className="panel intake-panel [background:var(--surface)] [border:1px_solid_var(--line)] rounded-xl shadow-[var(--shadow)] p-7 [&_.section-heading]:pb-[26px] [&_.section-heading]:[border-bottom:1px_solid_var(--line)] [&_.section-heading]:mb-[25px] [@media(max-width:_760px)]:p-5">
                <div className="section-heading flex items-center justify-between gap-3 [&_p]:text-[11px] [&_p]:m-[5px_0_0] [&_>_svg]:text-muted">
                  <div>
                    <h2 className="mt-0 text-[17px] tracking-[-0.35px] mb-1 [@media(max-width:_760px)]:text-[16px]">
                      Candidate information
                    </h2>
                    <p className="mt-0 text-muted leading-[1.7]">
                      A few details to start the conversation.
                    </p>
                  </div>
                  <span className="step text-[10px] text-muted">01 / 01</span>
                </div>
                <CandidateForm
                  demo={!connected}
                  pending={pending}
                  onSave={async (input) => {
                    await persist(
                      [...records, createCandidate(input)],
                      connected ? "Candidate saved." : "Demo candidate added.",
                      () => navigate("/candidates"),
                    );
                  }}
                />
              </section>
              <aside
                aria-label="Candidate intake guidance"
                className="intake-note [background:radial-gradient(ellipse_at_top_right,_var(--accent-wash),_transparent_65%),_var(--accent-soft)] rounded-xl p-[30px] text-[var(--accent)] [border:1px_solid_var(--accent-line)] [&_h2]:text-[24px] [&_h2]:text-ink [&_h2]:m-[20px_0_14px] [&_p]:text-[12px] [&_p]:text-muted [&_ol]:text-[12px] [&_ol]:leading-[2.5] [&_ol]:pl-[18px] [&_h3]:text-[14px] [&_h3]:text-ink [&_h3]:m-[12px_0] [@media(max-width:_760px)]:p-6"
              >
                <Sparkles size={28} />
                <h2 className="mt-0 text-[17px] tracking-[-0.35px] mb-1 [@media(max-width:_760px)]:text-[16px]">
                  {connected
                    ? "A considered hiring process."
                    : "Try the whole journey."}
                </h2>
                <p className="mt-0 text-muted leading-[1.7]">
                  Add a candidate, explore their profile, and move them through
                  your pipeline.
                </p>
                <ol>
                  <li>
                    {connected
                      ? "Add candidate information"
                      : "Add fictional information"}
                  </li>
                  <li>Review the candidate profile</li>
                  <li>Shortlist, reject or reopen</li>
                </ol>
                <div className="note-rule h-px [background:var(--accent-line)] m-[24px_0]" />
                <ShieldCheck size={21} />
                <h3 className="mt-0 font-semibold">
                  {connected
                    ? "Your private workspace"
                    : "A safe place to explore"}
                </h3>
                <p className="mt-0 text-muted leading-[1.7]">
                  {connected
                    ? "Records are saved to your account. This workspace does not send applications or email candidates."
                    : "Data stays in this browser. There is no employer connection, email delivery or account. Please do not enter real applicant information."}
                </p>
              </aside>
            </div>
          ) : (
            <>
              {overview && (
                <>
                  <section className="metrics grid grid-cols-[repeat(4,_1fr)] gap-4 mb-6 [@media(max-width:_1150px)]:gap-2.5 [@media(max-width:_760px)]:grid-cols-[repeat(2,_1fr)] [@media(max-width:_760px)]:gap-3">
                    {[
                      {
                        label: "Total candidates",
                        value: records.length,
                        detail: "Across all open roles",
                        icon: Users,
                      },
                      {
                        label: "In review",
                        value: counts.applied,
                        detail: "Ready for a closer look",
                        icon: BriefcaseBusiness,
                      },
                      {
                        label: "Shortlisted",
                        value: counts.shortlisted,
                        detail: "One step closer",
                        icon: Check,
                      },
                      {
                        label: "Roles represented",
                        value: new Set(records.map((c) => c.jobTitle)).size,
                        detail: "Engineering opportunities",
                        icon: LayoutDashboard,
                      },
                    ].map(({ label, value, detail, icon: Icon }) => (
                      <div
                        className='metric panel [background:var(--surface)] [border:1px_solid_var(--line)] rounded-xl shadow-[var(--shadow)] p-[18px_20px] relative overflow-hidden [&_>_div]:flex [&_>_div]:items-center [&_>_div]:justify-between [&_>_div]:text-muted [&_>_div]:text-[12px] [&_>_div_>_span]:text-[var(--accent)] [&_>_div_>_span]:[background:var(--accent-soft)] [&_>_div_>_span]:rounded-[7px] [&_>_div_>_span]:p-1.5 [&_>_div_>_span]:flex [&_>_div_>_span]:[border:1px_solid_var(--accent-line)] [&_>_strong]:block [&_>_strong]:text-[33px] [&_>_strong]:font-semibold [&_>_strong]:tracking-[-1px] [&_>_strong]:m-[4px_0] [&_small]:text-[10px] [@media(max-width:_1150px)]:p-[15px] [@media(max-width:_1150px)]:[&_>_div]:text-[10px] [@media(max-width:_1150px)]:[&_small]:text-[9px] [@media(max-width:_760px)]:p-4 [@media(max-width:_760px)]:[&_>_div]:text-[11px] [@media(max-width:_760px)]:[&_>_strong]:text-[29px] [&::after]:content-[""] [&::after]:absolute [&::after]:h-0.5 [&::after]:[inset:auto_22px_0] [&::after]:[background:linear-gradient(_90deg,_transparent,_var(--accent-line),_transparent_)] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_650ms_var(--ease-out)_both] [@media(prefers-reduced-motion:_no-preference)]:[&:nth-child(2)]:[animation-delay:55ms] [@media(prefers-reduced-motion:_no-preference)]:[&:nth-child(3)]:[animation-delay:110ms] [@media(prefers-reduced-motion:_no-preference)]:[&:nth-child(4)]:[animation-delay:165ms]'
                        key={label}
                      >
                        <div>
                          {label}
                          <span>
                            <Icon size={19} />
                          </span>
                        </div>
                        <strong
                          key={value}
                          className="metric-value [font-variant-numeric:tabular-nums] [@media(prefers-reduced-motion:_no-preference)]:animate-[value-in_450ms_var(--ease-out)_both]"
                        >
                          {String(value).padStart(2, "0")}
                        </strong>
                        <small className="block text-muted text-[12px]">
                          {detail}
                        </small>
                      </div>
                    ))}
                  </section>
                  <div className="overview-grid grid grid-cols-[1fr] gap-5 mb-7 [@media(max-width:_760px)]:grid-cols-[1fr] [@media(max-width:_760px)]:gap-4 [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_650ms_90ms_var(--ease-out)_both]">
                    <section className='spotlight [background:radial-gradient(ellipse_at_100%_20%,_var(--accent-wash),_transparent_65%),_var(--accent-soft)] [border:1px_solid_var(--accent-line)] rounded-xl flex relative overflow-hidden min-h-[248px] p-7 [isolation:isolate] items-center gap-6 [&_.eyebrow]:text-[var(--accent)] [&_.eyebrow]:text-[8px] [&_h2]:text-[25px] [&_h2]:leading-[1.25] [&_h2]:tracking-[-0.7px] [&_h2]:font-semibold [&_h2]:m-[12px_0] [&_p]:text-[11px] [&_p]:text-muted [&_p]:leading-[1.8] [&_a]:text-[var(--accent)] [&_a]:text-[11px] [&_a]:font-[650] [&_a]:flex [&_a]:gap-3.5 [&_a]:items-center [&_a]:mt-[17px] [@media(min-width:_1500px)]:p-8 [@media(min-width:_1500px)]:[&_h2]:text-[29px] [@media(max-width:_760px)]:min-h-[230px] [@media(max-width:_760px)]:p-[22px_16px] [@media(max-width:_760px)]:block [@media(max-width:_760px)]:[&_h2]:text-[23px] [@media(max-width:_760px)]:[&_p]:text-[10px] [&::before]:content-[""] [&::before]:absolute [&::before]:w-[270px] [&::before]:h-[270px] [&::before]:[border:1px_solid_var(--accent-line)] [&::before]:rounded-[50%] [&::before]:right-[-120px] [&::before]:top-[-140px] [&::before]:[pointer-events:none] [@media(prefers-reduced-motion:_no-preference)]:[&_a:hover_svg]:[transform:translate(2px,_-2px)] [@media(prefers-reduced-motion:_no-preference)]:[&_a_svg]:[transition:transform_200ms_var(--ease-out)] [@media(min-width:_761px)_and_(max-width:_1150px)]:flex-col [@media(min-width:_761px)_and_(max-width:_1150px)]:items-stretch'>
                      <div className="spotlight-copy relative z-[1] max-w-[30%] [flex:0_0_30%] [@media(max-width:_1150px)]:max-w-[90%] [@media(max-width:_760px)]:max-w-full [@media(max-width:_1150px)_and_(min-width:_761px)]:max-w-[84%] [&_h2]:text-[27px] [@media(min-width:_761px)_and_(max-width:_1150px)]:max-w-[none] [@media(min-width:_761px)_and_(max-width:_1150px)]:[flex-basis:auto] [@media(min-width:_761px)_and_(max-width:_1150px)]:[&_h2_br]:hidden [@media(min-width:_761px)_and_(max-width:_1150px)]:[&_p_br]:hidden [@media(max-width:_760px)]:[&_h2]:text-[25px]">
                        <span className="eyebrow text-[9px] font-[750] tracking-[1.8px] text-muted mb-[11px] [@media(max-width:_760px)]:text-[8px]">
                          PEOPLE, BEFORE PAPERWORK
                        </span>
                        <h2 className="mt-0 text-[17px] tracking-[-0.35px] mb-1 [@media(max-width:_760px)]:text-[16px]">
                          Your next great hire
                          <br />
                          is in the details.
                        </h2>
                        <p className="mt-0 text-muted leading-[1.7]">
                          {counts.applied} candidates are waiting for a closer
                          look.
                          <br />
                          Give every application a thoughtful next step.
                        </p>
                        <Link to="/candidates?status=applied">
                          Review applications <ArrowRight size={17} />
                        </Link>
                      </div>
                      <PipelineScene
                        onReplay={() => setMotionReplay((i) => i + 1)}
                      />
                    </section>
                    <section className="panel pipeline [background:var(--surface)] [border:1px_solid_var(--line)] rounded-xl shadow-[var(--shadow)] p-[22px] grid grid-cols-[repeat(3,_minmax(0,_1fr))] gap-[0_28px] [&_>_small]:text-[9px] [&_>_small]:text-muted [&_>_small]:[grid-column:1_/_-1] [@media(max-width:_760px)]:p-5 [@media(max-width:_760px)]:grid-cols-[1fr] [@media(max-width:_760px)]:gap-0 [&_>_.section-heading]:[grid-column:1_/_-1] [&_.bar]:h-[7px]">
                      <div className="section-heading flex items-center justify-between gap-3 [&_p]:text-[11px] [&_p]:m-[5px_0_0] [&_>_svg]:text-muted">
                        <h2 className="mt-0 text-[17px] tracking-[-0.35px] mb-1 [@media(max-width:_760px)]:text-[16px]">
                          Pipeline snapshot
                        </h2>
                        <span className="count [background:var(--soft)] p-[2px_7px] [border:1px_solid_var(--line)] rounded-[5px] text-muted text-[10px] [vertical-align:middle] ml-1.5">
                          {records.length}
                        </span>
                      </div>
                      {statuses.map((s) => (
                        <div
                          className="pipeline-row m-[18px_0] [&_>_div:first-child]:flex [&_>_div:first-child]:justify-between [&_>_div:first-child]:text-[11px] [&_>_div:first-child]:mb-[7px] [&_span]:flex [&_span]:items-center [&_span]:gap-[7px] [&_span]:text-muted [&_strong]:text-[11px] [&_strong]:font-semibold [&_i]:w-[5px] [&_i]:h-[5px] [&_i]:[background:currentColor] [&_i]:rounded-[50%] [@media(max-width:_760px)]:m-[16px_0] [@media(prefers-reduced-motion:_no-preference)]:[&:nth-child(3)_.bar_span]:[animation-delay:260ms] [@media(prefers-reduced-motion:_no-preference)]:[&:nth-child(4)_.bar_span]:[animation-delay:340ms]"
                          key={s}
                        >
                          <div>
                            <span>
                              <i className={s} />
                              {statusLabel(s)}
                            </span>
                            <strong>{counts[s]}</strong>
                          </div>
                          <div className="bar h-[5px] rounded-[10px] [background:var(--soft)] overflow-hidden [&_span]:h-full [&_span]:rounded-[10px] [&_.applied]:[background:var(--chart-review)] [&_.shortlisted]:[background:var(--chart-shortlist)] [&_.rejected]:[background:var(--chart-reject)] [@media(prefers-reduced-motion:_no-preference)]:[&_span]:[transform-origin:left] [@media(prefers-reduced-motion:_no-preference)]:[&_span]:animate-[chart-reveal_850ms_180ms_var(--ease-out)_both] [@media(prefers-reduced-motion:_no-preference)]:[&_span]:[transition:width_500ms_var(--ease-out)] [@media(prefers-reduced-motion:_no-preference)]:[&_span]:[animation-duration:1200ms]">
                            <span
                              className={s}
                              key={`${s}-${motionReplay}`}
                              style={{
                                width: `${records.length ? (counts[s] / records.length) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <small className="block text-muted text-[12px]">
                        Based on your current {connected ? "saved" : "demo"}{" "}
                        records
                      </small>
                    </section>
                  </div>
                </>
              )}
              <CandidateList
                records={records}
                onSelect={(id) => {
                  setSelected(id);
                  setEditing(false);
                  setError("");
                  setNotice("");
                }}
              />
            </>
          )}
          <footer className="flex justify-between text-[9px] text-muted p-[24px_0_5px] [&_span:last-child]:text-[8px] [&_span:last-child]:tracking-[1.4px] [@media(max-width:_760px)]:block [@media(max-width:_760px)]:text-[9px] [@media(max-width:_760px)]:[&_span:last-child]:block [@media(max-width:_760px)]:[&_span:last-child]:mt-2">
            <span>
              {connected
                ? "Private candidate workspace. Records save to your account."
                : "Fictional data, saved in this browser. No application reaches an employer."}
            </span>
            {!connected && (
              <button
                className="mobile-reset [font:inherit] [-webkit-tap-highlight-color:transparent] items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] hidden [@media(max-width:_760px)]:inline-flex [@media(max-width:_760px)]:m-[12px_0] [@media(max-width:_760px)]:text-[11px] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
                onClick={() => {
                  setError("");
                  setReset(true);
                }}
              >
                Reset demo data
              </button>
            )}
            <span>
              {connected ? "FORMA · ACCOUNT WORKSPACE" : "FORMA · LOCAL DEMO"}
            </span>
          </footer>
        </main>
      </div>
      {candidate && (
        <Modal
          title={editing ? "Edit candidate" : "Candidate profile"}
          onClose={() => {
            if (!pending) {
              setSelected(null);
              setError("");
            }
          }}
        >
          {error && (
            <div
              className="alert p-[12px_16px] mb-[18px] rounded-lg text-[12px] [background:var(--danger-soft)] text-danger [border:1px_solid_var(--danger-line)] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_320ms_var(--ease-out)_both]"
              role="alert"
            >
              {error}
            </div>
          )}
          {notice && (
            <p
              role="status"
              className="notice mt-0 p-[12px_16px] mb-[18px] rounded-lg text-[12px] [background:var(--success-soft)] text-[var(--success)] [border:1px_solid_var(--success-line)] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_320ms_var(--ease-out)_both]"
            >
              {notice}
            </p>
          )}
          {editing ? (
            <CandidateForm
              demo={!connected}
              initial={candidate}
              pending={pending}
              onCancel={() => setEditing(false)}
              onSave={async (input) => {
                await persist(
                  records.map((c) =>
                    c.id === candidate.id ? { ...c, ...input } : c,
                  ),
                  "Candidate updated.",
                  () => setEditing(false),
                );
              }}
            />
          ) : (
            <>
              <div className="profile-hero text-center [background:var(--accent-soft)] rounded-[10px] p-5 mb-[22px] [border:1px_solid_var(--accent-line)] [&_h3]:text-[23px] [&_h3]:m-0 [&_p]:text-[12px] [&_p]:m-[4px_0_10px]">
                <span className="avatar large grid [place-items:center] [background:var(--accent-soft)] text-[var(--accent)] rounded-[50%] shrink-0 h-[60px] w-[60px] text-[20px] m-[0_auto_12px]">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <h3 className="mt-0 font-semibold">{candidate.name}</h3>
                <p className="mt-0 text-muted leading-[1.7]">
                  {candidate.jobTitle}
                </p>
                <span
                  className={
                    `badge ${candidate.status}` +
                    " badge [&_i]:w-[5px] [&_i]:h-[5px] [&_i]:[background:currentColor] [&_i]:rounded-[50%] inline-flex items-center gap-[5px] text-[9px] rounded-[5px] p-[3px_7px] [border:1px_solid_transparent] font-[550] [&.applied]:text-[var(--accent)] [&.applied]:[background:var(--accent-soft)] [&.applied]:border-[var(--accent-line)] [&.shortlisted]:text-[var(--success)] [&.shortlisted]:[background:var(--success-soft)] [&.shortlisted]:border-[var(--success-line)] [&.rejected]:text-danger [&.rejected]:[background:var(--danger-soft)] [&.rejected]:border-[var(--danger-line)] [@media(prefers-reduced-motion:_no-preference)]:animate-[fade-in_250ms_ease_both]"
                  }
                >
                  <i />
                  {statusLabel(candidate.status)}
                </span>
              </div>
              <dl className="grid grid-cols-[1fr_1fr] gap-5 [@media(max-width:_760px)]:grid-cols-[1fr]">
                <div>
                  <dt className="text-[10px] text-muted mb-[5px]">Email</dt>
                  <dd className="m-0 text-[12px] [overflow-wrap:anywhere]">
                    {candidate.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-muted mb-[5px]">Phone</dt>
                  <dd className="m-0 text-[12px] [overflow-wrap:anywhere]">
                    {candidate.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-muted mb-[5px]">
                    Experience
                  </dt>
                  <dd className="m-0 text-[12px] [overflow-wrap:anywhere]">
                    {candidate.experience} years
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-muted mb-[5px]">Added</dt>
                  <dd className="m-0 text-[12px] [overflow-wrap:anywhere]">
                    {date(candidate.createdAt)}
                  </dd>
                </div>
              </dl>
              <h3 className="small-title font-semibold text-[12px] mt-6">
                Skills
              </h3>
              <div className="skills flex flex-wrap gap-1.5 [&_span]:p-[5px_8px] [&_span]:[background:var(--accent-soft)] [&_span]:text-[var(--accent)] [&_span]:rounded-[5px] [&_span]:text-[11px]">
                {candidate.skills.split(",").map((skill, i) => (
                  <span key={i}>{skill.trim()}</span>
                ))}
              </div>
              <p className="local-note text-muted text-[10px] mt-[22px]">
                {connected
                  ? "Private candidate profile · Changes save to your account."
                  : "Fictional demo profile · Changes are saved only in this browser."}
              </p>
              <div className="dialog-actions flex justify-end flex-wrap gap-2 [border-top:1px_solid_var(--line)] pt-5 [&_button]:text-[12px]">
                <button
                  disabled={pending}
                  onClick={() => setEditing(true)}
                  className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
                >
                  Edit details
                </button>
                {statuses
                  .filter((s) => s !== candidate.status)
                  .map((s) => (
                    <button
                      key={s}
                      disabled={pending}
                      className={
                        s === "shortlisted"
                          ? 'primary [font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [button&]:[background:var(--primary)] [button&]:text-[#ffffff] [button&]:border-primary [button&]:shadow-[0_3px_5px_#5348c31a] [button&:hover]:[background:var(--primary-hover)] [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [[data-theme="dark"]_button&]:text-[#211937] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[button&:hover]:[transform:translateY(-2px)] [@media(prefers-reduced-motion:_no-preference)]:[button&:hover]:shadow-[0_6px_18px_var(--halo)] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]'
                          : s === "rejected"
                            ? "danger [font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed text-danger border-[var(--danger-line)] [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
                            : "[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
                      }
                      onClick={() =>
                        persist(
                          changeStatus(records, candidate.id, s),
                          `${candidate.name}: ${statusLabel(s)}.`,
                        )
                      }
                    >
                      {pending
                        ? "Saving…"
                        : s === "applied"
                          ? "Reopen"
                          : s === "shortlisted"
                            ? "Shortlist"
                            : "Reject"}
                    </button>
                  ))}
              </div>
            </>
          )}
        </Modal>
      )}
      {reset && (
        <Modal
          title="Reset demo data?"
          onClose={() => {
            if (!pending) setReset(false);
          }}
        >
          <p className="mt-0 text-muted leading-[1.7]">
            This replaces all locally added candidates and edits with the
            original 16 fictional profiles. This cannot be undone.
          </p>
          {error && (
            <div
              className="alert p-[12px_16px] mb-[18px] rounded-lg text-[12px] [background:var(--danger-soft)] text-danger [border:1px_solid_var(--danger-line)] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_320ms_var(--ease-out)_both]"
              role="alert"
            >
              {error}
            </div>
          )}
          <div className="dialog-actions flex justify-end flex-wrap gap-2 [border-top:1px_solid_var(--line)] pt-5 [&_button]:text-[12px]">
            <button
              disabled={pending}
              onClick={() => setReset(false)}
              className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
            >
              Keep my changes
            </button>
            <button
              className="danger [font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed text-danger border-[var(--danger-line)] [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
              disabled={pending}
              onClick={() =>
                persist(
                  structuredClone(fixtures),
                  "Demo workspace reset.",
                  () => {
                    setReset(false);
                    setWarning("");
                  },
                )
              }
            >
              {pending ? "Resetting…" : "Reset demo data"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
