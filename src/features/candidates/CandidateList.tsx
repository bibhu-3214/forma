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
    <section className="panel list-panel">
      <div className="section-heading">
        <div>
          <h2>
            Candidate directory <span className="count">{records.length}</span>
          </h2>
          <p>A clear view of every application.</p>
        </div>
        <SlidersHorizontal size={19} />
      </div>
      <div className="filters">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Search candidates"
            placeholder="Search name, email or skills…"
            value={f.query}
            onChange={(e) => update("q", e.target.value)}
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
        className="table-scroll focus-visible:outline-2 focus-visible:outline-primary"
        role="region"
        aria-label="Candidate directory table, scroll for more columns"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Applied for</th>
              <th>Experience</th>
              <th>Status</th>
              <th>
                Added <ArrowDown size={12} />
              </th>
              <th>
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody key={params.toString()}>
            {shown.map((c, i) => (
              <tr key={c.id}>
                <td>
                  <button className="person" onClick={() => onSelect(c.id)}>
                    <span className={`avatar tone-${i % 4}`}>
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span>
                      <strong>{c.name}</strong>
                      <small>{c.email}</small>
                    </span>
                  </button>
                </td>
                <td>
                  {c.jobTitle}
                  <small>{c.skills.split(",").slice(0, 2).join(" ·")}</small>
                </td>
                <td>{c.experience} years</td>
                <td>
                  <span key={c.status} className={`badge ${c.status}`}>
                    <i />
                    {statusLabel(c.status)}
                  </span>
                </td>
                <td>{date(c.createdAt)}</td>
                <td>
                  <button
                    className="icon-button"
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
        <div className="empty">
          <Search size={30} />
          <h3>No candidates found</h3>
          <p>Try another search or clear your filters.</p>
          <button onClick={() => setParams({})}>Clear filters</button>
        </div>
      )}
      <div className="pagination">
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
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
