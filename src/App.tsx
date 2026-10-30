import PipelineScene from "./features/overview/PipelineScene";
import ThemeControl from "./features/appearance/ThemeControl";
import Modal from "./components/Modal";
import CandidateList from "./features/candidates/CandidateList";
import { formatDate as date } from "./lib/format";
import { useState } from "react";
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
    <div className={connected ? "app connected-app" : "app"}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-symbol">f</span>forma
          <span className="brand-dot">.</span>
        </Link>
        <div className="workspace">
          <span className="workspace-icon">
            <BriefcaseBusiness size={19} />
          </span>
          <div>
            <strong>Talent workspace</strong>
            <small>{connected ? "Account workspace" : "Demo workspace"}</small>
          </div>
          <span className="workspace-dot" />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          <NavLink to="/" end>
            <LayoutDashboard size={19} />
            Overview
          </NavLink>
          <NavLink to="/candidates">
            <Users size={19} />
            Candidates<span className="nav-count">{records.length}</span>
          </NavLink>
          <NavLink to="/intake">
            <Plus size={19} />
            Candidate intake
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          {!connected && (
            <div className="demo-card">
              <ShieldCheck size={22} />
              <strong>Made for exploring</strong>
              <p>
                Fictional candidates. Local data.
                <br />
                No application reaches an employer.
              </p>
              <button
                onClick={() => {
                  setError("");
                  setReset(true);
                }}
              >
                <RotateCcw size={14} />
                Reset demo data
              </button>
            </div>
          )}
          <div className="profile">
            <span className="avatar">TW</span>
            <div>
              <strong>Talent team</strong>
              <small>
                {connected
                  ? "Private candidate workspace"
                  : "Local demo workspace"}
              </small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
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
          <div className="topbar-actions">
            <ThemeControl />
            <span className="demo-label">
              <i />
              {connected ? "Account workspace" : "Demo workspace"}
            </span>
          </div>
        </header>
        <main id="main" key={location.pathname}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR NEXT GREAT TEAM STARTS HERE</div>
              <h1>
                {intake
                  ? "Make room for new talent."
                  : overview
                    ? "A little clarity. A lot of potential."
                    : "Good people, all in one place."}
              </h1>
              <p>
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
              <Link className="button primary" to="/intake">
                <Plus size={18} />
                Add candidate
              </Link>
            )}
          </div>
          {warning && (
            <div className="alert" role="alert">
              {warning}
            </div>
          )}
          {!candidate && !reset && error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          <div role="status" className={notice ? "notice" : ""}>
            {notice}
          </div>
          {intake ? (
            <div className="intake-grid">
              <section className="panel intake-panel">
                <div className="section-heading">
                  <div>
                    <h2>Candidate information</h2>
                    <p>A few details to start the conversation.</p>
                  </div>
                  <span className="step">01 / 01</span>
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
              <aside className="intake-note">
                <Sparkles size={28} />
                <h2>{connected ? "A considered hiring process." : "Try the whole journey."}</h2>
                <p>
                  Add a candidate, explore their profile, and move them through
                  your pipeline.
                </p>
                <ol>
                  <li>{connected ? "Add candidate information" : "Add fictional information"}</li>
                  <li>Review the candidate profile</li>
                  <li>Shortlist, reject or reopen</li>
                </ol>
                <div className="note-rule" />
                <ShieldCheck size={21} />
                <h3>{connected ? "Your private workspace" : "A safe place to explore"}</h3>
                <p>
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
                  <section className="metrics">
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
                      <div className="metric panel" key={label}>
                        <div>
                          {label}
                          <span>
                            <Icon size={19} />
                          </span>
                        </div>
                        <strong key={value} className="metric-value">
                          {String(value).padStart(2, "0")}
                        </strong>
                        <small>{detail}</small>
                      </div>
                    ))}
                  </section>
                  <div className="overview-grid">
                    <section className="spotlight">
                      <div className="spotlight-copy">
                        <span className="eyebrow">
                          PEOPLE, BEFORE PAPERWORK
                        </span>
                        <h2>
                          Your next great hire
                          <br />
                          is in the details.
                        </h2>
                        <p>
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
                    <section className="panel pipeline">
                      <div className="section-heading">
                        <h2>Pipeline snapshot</h2>
                        <span className="count">{records.length}</span>
                      </div>
                      {statuses.map((s) => (
                        <div className="pipeline-row" key={s}>
                          <div>
                            <span>
                              <i className={s} />
                              {statusLabel(s)}
                            </span>
                            <strong>{counts[s]}</strong>
                          </div>
                          <div className="bar">
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
                      <small>
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
          <footer>
            <span>
              {connected
                ? "Private candidate workspace. Records save to your account."
                : "Fictional data, saved in this browser. No application reaches an employer."}
            </span>
            {!connected && (
              <button
                className="mobile-reset"
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
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <p role="status" className="notice">
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
              <div className="profile-hero">
                <span className="avatar large">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <h3>{candidate.name}</h3>
                <p>{candidate.jobTitle}</p>
                <span className={`badge ${candidate.status}`}>
                  <i />
                  {statusLabel(candidate.status)}
                </span>
              </div>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{candidate.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{candidate.phone}</dd>
                </div>
                <div>
                  <dt>Experience</dt>
                  <dd>{candidate.experience} years</dd>
                </div>
                <div>
                  <dt>Added</dt>
                  <dd>{date(candidate.createdAt)}</dd>
                </div>
              </dl>
              <h3 className="small-title">Skills</h3>
              <div className="skills">
                {candidate.skills.split(",").map((skill, i) => (
                  <span key={i}>{skill.trim()}</span>
                ))}
              </div>
              <p className="local-note">
                {connected
                  ? "Private candidate profile · Changes save to your account."
                  : "Fictional demo profile · Changes are saved only in this browser."}
              </p>
              <div className="dialog-actions">
                <button disabled={pending} onClick={() => setEditing(true)}>
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
                          ? "primary"
                          : s === "rejected"
                            ? "danger"
                            : ""
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
          <p>
            This replaces all locally added candidates and edits with the
            original 16 fictional profiles. This cannot be undone.
          </p>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          <div className="dialog-actions">
            <button disabled={pending} onClick={() => setReset(false)}>
              Keep my changes
            </button>
            <button
              className="danger"
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
