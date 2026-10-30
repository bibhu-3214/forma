import SelectControl from "../../components/SelectControl";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  filterCandidates,
  readFilters,
  roles,
  statuses,
  statusLabel,
  type Candidate,
} from "./model";
import { formatDate as date } from "../../lib/format";
export default function CandidateList({
  records,
  onSelect,
}: {
  records: Candidate[];
  onSelect: (id: string) => void;
}) {
  const [params, setParams] = useSearchParams();
  const f = readFilters(params);
  const filtered = filterCandidates(records, f);
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const page = Math.min(f.page, pages);
  const shown = filtered.slice((page - 1) * 6, page * 6);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  }
  return (
    <section className="panel list-panel [background:var(--surface)] [border:1px_solid_var(--line)] rounded-xl shadow-[var(--shadow)] [&_>_.section-heading]:p-[22px_22px_17px] [@media(max-width:_760px)]:[&_>_.section-heading]:p-[20px_16px] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_650ms_90ms_var(--ease-out)_both]">
      <div className="section-heading flex items-center justify-between gap-3 [&_p]:text-[11px] [&_p]:m-[5px_0_0] [&_>_svg]:text-muted">
        <div>
          <h2 className="mt-0 text-[17px] tracking-[-0.35px] mb-1 [@media(max-width:_760px)]:text-[16px]">
            Candidate directory{" "}
            <span className="count [background:var(--soft)] p-[2px_7px] [border:1px_solid_var(--line)] rounded-[5px] text-muted text-[10px] [vertical-align:middle] ml-1.5">
              {records.length}
            </span>
          </h2>
          <p className="mt-0 text-muted leading-[1.7]">
            A clear view of every application.
          </p>
        </div>
        <SlidersHorizontal size={19} />
      </div>
      <div className="filters flex gap-[9px] p-[0_22px_20px] [&_select]:min-w-0 [&_select]:text-[10px] [&_select]:p-[9px_28px_9px_10px] [&_select]:[flex:0_1_auto] [@media(max-width:_1150px)]:flex-wrap [@media(max-width:_1150px)]:[&_.search]:[flex-basis:100%] [@media(max-width:_1150px)]:[&_select]:[flex:1] [@media(max-width:_760px)]:p-[0_16px_16px] [@media(max-width:_760px)]:gap-[7px] [@media(max-width:_760px)]:[&_select]:[flex-basis:calc(50%_-_7px)] [@media(max-width:_760px)]:[&_select]:text-[10px] [@media(min-width:_1151px)]:[&_select]:w-auto [@media(min-width:_1151px)]:[&_select]:max-w-[210px] [@media(min-width:_1151px)]:[&_.search]:min-w-[220px] [&_.select-control]:[flex:0_1_180px] [@media(max-width:_1150px)]:[&_.select-control]:[flex:1] [@media(max-width:_760px)]:[&_.select-control]:[flex-basis:calc(50%_-_7px)] [@media(max-width:_480px)]:[&_.select-control]:[flex-basis:100%]">
        <label className="search flex items-center gap-2 [flex:1] text-muted [border:1px_solid_var(--line)] rounded-[7px] p-[0_10px] min-w-[130px] [&_input]:[border:none] [&_input]:p-[9px_0] [&_input]:w-full [&_input]:text-[11px] [&_input]:[background:transparent] [&:focus-within]:[outline:2px_solid_var(--focus)] [&_input:focus-visible]:[outline:none] [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)]">
          <Search size={18} />
          <input
            aria-label="Search candidates"
            placeholder="Search name, email or skills…"
            value={f.query}
            onChange={(e) => update("q", e.target.value)}
            className='[font:inherit] [-webkit-tap-highlight-color:transparent] [border:1px_solid_var(--line)] [background:var(--surface)] rounded-[7px] p-[11px_12px] text-ink w-full [&::placeholder]:text-muted [&[aria-invalid="true"]]:border-danger [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)]'
          />
        </label>
        <SelectControl
          aria-label="Filter by role"
          value={f.role}
          onChange={(e) => update("role", e.target.value)}
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </SelectControl>
        <SelectControl
          aria-label="Filter by status"
          value={f.status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option value={s} key={s}>
              {statusLabel(s)}
            </option>
          ))}
        </SelectControl>
        <SelectControl
          aria-label="Sort candidates"
          value={f.sort}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="experience">Experience</option>
        </SelectControl>
      </div>
      <div
        className="table-scroll focus-visible:outline-2 focus-visible:outline-primary overflow-x-auto relative"
        role="region"
        aria-label="Candidate directory table, scroll for more columns"
        tabIndex={0}
      >
        <table className="border-collapse w-full whitespace-nowrap text-left">
          <thead>
            <tr>
              <th className="[background:var(--soft)] [border-top:1px_solid_var(--line)] [border-bottom:1px_solid_var(--line)] text-muted text-[10px] font-medium p-[12px_14px] [&:first-child]:pl-[22px] [&_svg]:[vertical-align:middle] [&_svg]:ml-[3px]">
                Candidate
              </th>
              <th className="[background:var(--soft)] [border-top:1px_solid_var(--line)] [border-bottom:1px_solid_var(--line)] text-muted text-[10px] font-medium p-[12px_14px] [&:first-child]:pl-[22px] [&_svg]:[vertical-align:middle] [&_svg]:ml-[3px]">
                Applied for
              </th>
              <th className="[background:var(--soft)] [border-top:1px_solid_var(--line)] [border-bottom:1px_solid_var(--line)] text-muted text-[10px] font-medium p-[12px_14px] [&:first-child]:pl-[22px] [&_svg]:[vertical-align:middle] [&_svg]:ml-[3px]">
                Experience
              </th>
              <th className="[background:var(--soft)] [border-top:1px_solid_var(--line)] [border-bottom:1px_solid_var(--line)] text-muted text-[10px] font-medium p-[12px_14px] [&:first-child]:pl-[22px] [&_svg]:[vertical-align:middle] [&_svg]:ml-[3px]">
                Status
              </th>
              <th className="[background:var(--soft)] [border-top:1px_solid_var(--line)] [border-bottom:1px_solid_var(--line)] text-muted text-[10px] font-medium p-[12px_14px] [&:first-child]:pl-[22px] [&_svg]:[vertical-align:middle] [&_svg]:ml-[3px]">
                Added <ArrowDown size={12} />
              </th>
              <th className="[background:var(--soft)] [border-top:1px_solid_var(--line)] [border-bottom:1px_solid_var(--line)] text-muted text-[10px] font-medium p-[12px_14px] [&:first-child]:pl-[22px] [&_svg]:[vertical-align:middle] [&_svg]:ml-[3px]">
                <span className="sr-only absolute w-px h-px overflow-hidden [clip:rect(0,_0,_0,_0)]">
                  Details
                </span>
              </th>
            </tr>
          </thead>
          <tbody
            key={params.toString()}
            className="[&_tr:hover]:[background:var(--soft)] [@media(prefers-reduced-motion:_no-preference)]:[&_tr]:animate-[row-in_340ms_var(--ease-out)_both] [@media(prefers-reduced-motion:_no-preference)]:[&_tr:nth-child(2)]:[animation-delay:25ms] [@media(prefers-reduced-motion:_no-preference)]:[&_tr:nth-child(3)]:[animation-delay:50ms] [@media(prefers-reduced-motion:_no-preference)]:[&_tr:nth-child(4)]:[animation-delay:75ms] [@media(prefers-reduced-motion:_no-preference)]:[&_tr:nth-child(5)]:[animation-delay:100ms] [@media(prefers-reduced-motion:_no-preference)]:[&_tr:nth-child(6)]:[animation-delay:125ms]"
          >
            {shown.map((c, i) => (
              <tr key={c.id}>
                <td className="[&:first-child]:pl-[22px] p-[15px_14px] text-[10px] text-muted [border-bottom:1px_solid_var(--line)] [&_small]:text-[9px] [&_small]:text-muted [&_small]:mt-1">
                  <button
                    className="person [font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center rounded-lg text-ink cursor-pointer whitespace-nowrap [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [border:0] [background:none] p-0 gap-2.5 text-left text-[11px] min-h-[37px] font-normal [&:hover]:[background:transparent] [&:hover]:text-primary [&_strong]:font-semibold [&_strong]:text-ink [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
                    onClick={() => onSelect(c.id)}
                  >
                    <span
                      className={
                        `avatar tone-${i % 4}` +
                        " avatar grid [place-items:center] [background:var(--accent-soft)] text-[var(--accent)] rounded-[50%] h-[35px] w-[35px] text-[10px] shrink-0 [&.tone-1]:[background:var(--success-soft)] [&.tone-1]:text-[var(--success)] [&.tone-2]:[background:var(--warm-soft)] [&.tone-2]:text-[var(--warm)] [&.tone-3]:[background:var(--blue-soft)] [&.tone-3]:text-[var(--blue)]"
                      }
                    >
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span>
                      <strong>{c.name}</strong>
                      <small className="block text-muted text-[12px]">
                        {c.email}
                      </small>
                    </span>
                  </button>
                </td>
                <td className="[&:first-child]:pl-[22px] p-[15px_14px] text-[10px] text-muted [border-bottom:1px_solid_var(--line)] [&_small]:text-[9px] [&_small]:text-muted [&_small]:mt-1">
                  {c.jobTitle}
                  <small className="block text-muted text-[12px]">
                    {c.skills.split(",").slice(0, 2).join(" ·")}
                  </small>
                </td>
                <td className="[&:first-child]:pl-[22px] p-[15px_14px] text-[10px] text-muted [border-bottom:1px_solid_var(--line)] [&_small]:text-[9px] [&_small]:text-muted [&_small]:mt-1">
                  {c.experience} years
                </td>
                <td className="[&:first-child]:pl-[22px] p-[15px_14px] text-[10px] text-muted [border-bottom:1px_solid_var(--line)] [&_small]:text-[9px] [&_small]:text-muted [&_small]:mt-1">
                  <span
                    key={c.status}
                    className={
                      `badge ${c.status}` +
                      " badge [&_i]:w-[5px] [&_i]:h-[5px] [&_i]:[background:currentColor] [&_i]:rounded-[50%] inline-flex items-center gap-[5px] text-[9px] rounded-[5px] p-[3px_7px] [border:1px_solid_transparent] font-[550] [&.applied]:text-[var(--accent)] [&.applied]:[background:var(--accent-soft)] [&.applied]:border-[var(--accent-line)] [&.shortlisted]:text-[var(--success)] [&.shortlisted]:[background:var(--success-soft)] [&.shortlisted]:border-[var(--success-line)] [&.rejected]:text-danger [&.rejected]:[background:var(--danger-soft)] [&.rejected]:border-[var(--danger-line)] [@media(prefers-reduced-motion:_no-preference)]:animate-[fade-in_250ms_ease_both]"
                    }
                  >
                    <i />
                    {statusLabel(c.status)}
                  </span>
                </td>
                <td className="[&:first-child]:pl-[22px] p-[15px_14px] text-[10px] text-muted [border-bottom:1px_solid_var(--line)] [&_small]:text-[9px] [&_small]:text-muted [&_small]:mt-1">
                  {date(c.createdAt)}
                </td>
                <td className="[&:first-child]:pl-[22px] p-[15px_14px] text-[10px] text-muted [border-bottom:1px_solid_var(--line)] [&_small]:text-[9px] [&_small]:text-muted [&_small]:mt-1">
                  <button
                    className="icon-button [font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [border:0] [background:transparent] text-muted p-[5px] min-h-8 [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)] [@media(prefers-reduced-motion:_no-preference)]:[&:hover_svg]:[transform:translate(2px,_-2px)] [@media(prefers-reduced-motion:_no-preference)]:[&_svg]:[transition:transform_200ms_var(--ease-out)]"
                    aria-label={`View ${c.name}`}
                    onClick={() => onSelect(c.id)}
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!shown.length && (
        <div className="empty text-center p-10 text-[var(--accent)] [&_h3]:m-[12px_0_4px] [&_h3]:text-ink [&_p]:text-[12px] [@media(prefers-reduced-motion:_no-preference)]:animate-[rise-in_320ms_var(--ease-out)_both]">
          <Search size={30} />
          <h3 className="mt-0 font-semibold">No candidates found</h3>
          <p className="mt-0 text-muted leading-[1.7]">
            Try another search or clear your filters.
          </p>
          <button
            onClick={() => setParams({})}
            className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
          >
            Clear filters
          </button>
        </div>
      )}
      <div className="pagination flex justify-between items-center p-[16px_22px] text-muted text-[10px] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-3 [&_button]:min-h-[29px] [&_button]:p-[5px] [&_button]:rounded-[5px] [@media(max-width:_760px)]:p-[15px_12px] [@media(max-width:_760px)]:text-[9px] [@media(max-width:_760px)]:[&_>_div]:gap-[7px]">
        <span>
          {filtered.length
            ? `${(page - 1) * 6 + 1}–${Math.min(page * 6, filtered.length)}`
            : "0"}{" "}
          of {filtered.length} candidates
        </span>
        <div>
          <button
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => update("page", String(page - 1))}
            className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            aria-label="Next page"
            disabled={page === pages}
            onClick={() => update("page", String(page + 1))}
            className="[font:inherit] [-webkit-tap-highlight-color:transparent] inline-flex items-center justify-center gap-2 min-h-10 [border:1px_solid_var(--line)] rounded-lg [background:var(--surface)] p-[9px_14px] text-ink cursor-pointer font-semibold whitespace-nowrap [&:hover]:[background:var(--soft)] [&:disabled]:opacity-[0.5] [&:disabled]:cursor-not-allowed [@media(prefers-reduced-motion:_no-preference)]:[transition:background-color_180ms_ease,_border-color_180ms_ease,_color_180ms_ease,_box-shadow_180ms_ease,_transform_200ms_var(--ease-out)] [&:focus-visible]:[outline-offset:3px] [@media(prefers-reduced-motion:_no-preference)]:[&:active:not(:disabled)]:[transform:translateY(0)_scale(0.98)]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
