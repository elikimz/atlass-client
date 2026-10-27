# Kinetiq login-first redesign — implementation report

**Updated:** 27 October 2026

## Latest requested changes

The public marketing landing page and its stylesheet were removed. A guest visiting `/` now sees the sign-in/create-account screen; an authenticated member visiting `/` returns to the dashboard. The existing `/login` path remains available. The installed app now starts at `/` as well.

The dashboard no longer renders the **“ACCOUNT OVERVIEW / VERIFIED DATA”** hero, the “Your at a glance” copy, its browse-tasks CTA, or the active-plan/no-active-plan card. Members land directly on the separate withdrawal/deposit balances, the API-backed seven-day task-earnings chart and account activity panels.

The previous slate/cobalt/teal treatment was replaced with **Rosewood & Porcelain**: rich claret `#8F354C`, dusty rose `#D68A9B`, deep ink `#2B2024`, and warm porcelain `#FAF6F5`. Shared member, authentication, public, referral, payment and admin styling was brought onto the new palette while preserving semantic success, warning and error colors. The Kinetiq SVG mark, favicon and installed-app PNG icons were recolored without changing the mark silhouette or its maskable safe area.

## Preserved experience and behavior

- **Registration and sign-in:** phone, email and password remain the account credentials; the referral code is optional. Referral prefill, server-side phone normalization, exact API errors, and token persistence before `/auth/me` remain intact.
- **Member workspace:** deposit and withdrawal balances stay separate. The earnings chart uses `/dashboard/summary.earnings_history`; period totals, progress counts, earnings breakdown and recent task activity remain API-backed. Tasks, task review, training, learning, plans, referral sharing, payment history, recharge, payout, withdrawal destinations and settings retain their routes and API contracts.
- **Plans and referrals:** plan comparison and final confirmation retain the existing purchase/upgrade contracts and server eligibility; referral code provisioning, network totals and commission ledger remain API-backed.
- **Recharge and payout:** M-Pesa/crypto and proof-upload routes remain. Recharge requires final review and reports deposits as pending administrator review rather than credited. Payout copy reflects the configured server window and admin-review stage; `under_review` payouts remain in-flight and block duplicate requests.
- **Administration and performance:** the responsive operations shell and admin actions remain in place. Route-level lazy loading is retained; the deleted landing-page bundle is no longer imported.

## Backend integrity

No backend files or business rules were changed in this visual follow-up. Earlier hardening remains: task eligibility/session timing and reward idempotency are enforced server-side; migrations add duplicate guards without deleting/reconciling existing rows; notification read/dismiss state is member-scoped; withdrawal schedule and payment review labels follow server configuration/statuses. Email/certificate branding changes preserve their existing authorization and lifecycle behavior.

## Verification

- `npm run build` passed (TypeScript plus Vite production build). The main JavaScript chunk is approximately **349.39 kB raw / 111.66 kB gzip**.
- Focused ESLint passed for `src/App.tsx`, `src/pages/Dashboard.tsx` and `src/pages/Login.tsx`. An expanded run over every changed TSX file also reports legacy hook-order and `any`-type lint findings in `AdminNotifications.tsx`, `AdminTasks.tsx` and `AdminUsers.tsx`; this follow-up changed only color literals in those three pages, not their logic.
- The isolated Chromium suite passed: guest root opens sign-in; authenticated root redirects to the dashboard; the removed hero is absent; registration, plan activation/upgrade, referrals, 390px/320px layouts, tablet PWA install, recharge final review, payment-history status, duplicate-payout blocking and withdrawal-account dialog all passed.
- **63 API calls were intercepted by local fixtures.** No live API calls, unexpected external requests, account writes or payout submissions occurred. No browser JavaScript exceptions or console errors were observed.
- PWA manifest JSON validates with `start_url: "/"`, theme color `#8F354C`, and all three referenced icons present. `git diff --check` passed.
- Earlier backend regression verification: **39 passed, 1 skipped** using in-memory SQLite and a disposable signing secret; no backend test was rerun for this frontend-only follow-up.

## Deployment status and safety

Browser testing used local fixtures/mocks only. No production signup, plan purchase, recharge, payout or withdrawal-account mutation was attempted. The preceding frontend release was verified on the public Vercel alias; the deployment state for this follow-up is to be recorded after its main-branch push. Azure API readiness remains unconfirmed by these frontend-only checks.

Screenshots in the task workspace: `kinetiq-login-root-mobile.png`, `kinetiq-redesign-signup-mobile.png`, `kinetiq-redesign-dashboard-desktop.png`, `kinetiq-redesign-dashboard-mobile.png`, `kinetiq-redesign-plans-after.png`, `kinetiq-redesign-referrals-desktop.png`, `kinetiq-recharge-pending-review.png`, `kinetiq-payout-under-review.png` and `kinetiq-admin-dashboard-mobile.png`.
