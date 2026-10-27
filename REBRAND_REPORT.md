# Kinetiq member experience redesign — implementation report

**Updated:** 27 October 2026

## Identity and design

Kinetiq now uses the approved **Cobalt Field Atlas** system: ink navy, cobalt, warm field-paper surfaces and persimmon accents, with an editorial/operational register motif. The new Kinetiq mark, public/authentication experience, member shell and mobile navigation replace the previous brand treatment. Authenticated routes are lazy-loaded; the 39-page route manifest now matches the React Router page declarations and excludes catch-all routes.

## Experience and behavior

- **Registration and sign-in:** phone, email and password are the account credentials; a referral code is optional. Referral prefill, server-side phone normalization, exact API errors, and token persistence before `/auth/me` are preserved.
- **Member workspace:** the dashboard presents task-first next actions, separate server-sourced wallet balances and account/earnings snapshots. Tasks, task review, training, learning, plans, referral sharing, payment history, recharge, payout, withdrawal destinations and settings use the Atlas shell and responsive design system.
- **Plans and referrals:** plan comparison and final confirmation retain the existing purchase/upgrade contracts and server eligibility; referral code provisioning, network totals and commission ledger remain API-backed.
- **Recharge and payout:** recharge preserves M-Pesa/crypto and proof-upload routes, adds explicit final review, and reports deposits as pending administrator review rather than credited. Payout review presents the configured server window, calls out the administrator-review stage, and never reports payment as complete before a server completion status. `under_review` payouts count as in-flight and block another request.
- **Administration:** the control-room shell and dashboard use the Atlas system, grouped navigation and responsive menu. The existing admin-management route APIs and actions are retained under this shell; individual tables/forms were not rewritten to new business contracts.
- **Performance and install:** route-level lazy loading remains enabled. At 1024px, the install action is visible and usable; mobile layouts were checked at 390px. Icons and email branding use Kinetiq artwork; support links are shown only when a real configured URL exists.

## Backend integrity

Task eligibility/session timing and reward idempotency are enforced server-side; migrations add duplicate guards without deleting/reconciling existing rows, and per-member read/dismiss state is added for shared notifications. Withdrawal schedule and deposit/payout review labels reflect server configuration/statuses. Email and certificate branding were updated without changing token lifecycles, authorization gates or API route signatures. The uniqueness migration deliberately stops if duplicate progress rows exist; any reconciliation must be handled explicitly rather than silently removing financial/progress history.

## Verification

- `npm run build` passed (TypeScript plus Vite production build). The main JavaScript chunk is **349.52 kB raw / 111.68 kB gzip**; the frontend dependencies were not expanded.
- Focused ESLint passed for the revised shell, dashboard, auth-adjacent/PWA and payment/account routes. `git diff --check` passed.
- Backend regression suite: **39 passed, 1 skipped**, using in-memory SQLite and a disposable signing secret; 28 existing deprecation warnings were emitted.
- The Chromium suite passed against intercepted fixtures: registration/referral prefill, dashboard, plan activation/upgrade, referral network/ledger, mobile menu, tablet install, proof upload/final recharge review, payment-history status, duplicate-payout blocking for `under_review`, and withdrawal-account dialog. **55 API requests were intercepted; no live account or financial write was sent.** A separate admin smoke test passed at 390px.
- At 390px, dashboard, plans, referrals, payment history and admin had no horizontal overflow. The tablet install control at 1024px measured 154 × 44 CSS pixels. The static route manifest returned HTTP 200 and matched all 39 current page routes.

## Safety and scope

All browser fixtures were local/mocked. No production signup, plan purchase, recharge, payout, or withdrawal-account mutation was attempted. Production behavior is still governed by the existing backend checks; fixture tests prove the client journey and request shapes, not live API availability. Production deployment/readiness must be checked separately after the authorized main-branch push.

Screenshots are in the task workspace: `kinetiq-redesign-signup-mobile.png`, `kinetiq-redesign-dashboard-desktop.png`, `kinetiq-redesign-dashboard-mobile.png`, `kinetiq-redesign-plans-after.png`, `kinetiq-redesign-referrals-desktop.png`, `kinetiq-recharge-pending-review.png`, `kinetiq-payout-under-review.png` and `kinetiq-admin-dashboard-mobile.png`.
