**Forma quality baseline — 31 October 2026**

Restored the two-column sign-in layout, visible primary buttons and consistent Tailwind controls. Improved sign-in contrast, landmark names, page titles, route focus and account-dialog focus restoration.

Verified locally: strict TypeScript, lint, production build, 29 frontend/domain tests and 4 passing browser cases. The new `test:a11y` command checks rendered accessibility, overflow, light/dark appearance and modal keyboard behavior. It uses axe WCAG A/AA and best-practice rules; automated results do not establish complete [WCAG 2.2](https://www.w3.org/TR/WCAG22/) conformance.

Connected browser tests create synthetic accounts and candidates in a temporary PostgreSQL database. The existing browser workflow discovers the new accessibility case.

Run `npm run test:a11y` after installing Playwright Chromium, or use `PLAYWRIGHT_CHANNEL=chrome npm run test:a11y` with installed Chrome. Existing strict/unit/build checks remain required. Production dependency audit reported zero known advisories on this date. This was a dependency/configuration review, not an exhaustive security assessment.

The running application and API passed a fresh health check. Live review used read-only business workflows; test writes used isolated fixtures. Remote CI, deployment, hosted recovery and manual assistive-technology acceptance are not established by these results.
