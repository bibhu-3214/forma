import { test, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { z } from "zod";
import product from "../product.json";
import { candidateSchema } from "../src/features/candidates/model";

test("explicit legacy conversion preserves records and refuses overwrites", () => {
  const folder = mkdtempSync(join(tmpdir(), "workspace-conversion-"));
  try {
    const input = join(folder, "legacy.json"),
      output = join(folder, "converted.json");
    const original = JSON.stringify({
      candidates: [
        {
          id: "legacy-1",
          createdAt: "2026-01-01T00:00:00.000Z",
          name: "Fictional Candidate",
          email: "fictional@example.test",
          phone: "1234567890",
          skills: "TypeScript",
          jobTitle: "Front-End Developer",
          experience: 3,
          status: "applied",
        },
      ],
    });
    writeFileSync(input, original);
    const convert = () =>
      spawnSync(
        process.execPath,
        ["scripts/convert-legacy.mjs", input, output],
        { encoding: "utf8" },
      );
    const result = convert();
    expect(result.status, result.stderr).toBe(0);
    const raw: unknown = JSON.parse(readFileSync(output, "utf8"));
    const parsed = z
      .object({
        version: z.literal(1),
        product: z.literal(product.id),
        records: z.array(candidateSchema),
      })
      .strict()
      .parse(raw);
    expect(parsed.records).toHaveLength(1);
    const record = parsed.records[0];
    expect(record.id).toBe("legacy-1");
    const saved = readFileSync(output, "utf8");
    expect(convert().status).not.toBe(0);
    expect(readFileSync(input, "utf8")).toBe(original);
    expect(readFileSync(output, "utf8")).toBe(saved);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
