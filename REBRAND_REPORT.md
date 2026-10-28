# Pacecraft rebrand and workspace update

**Updated:** 28 October 2026

## Identity

The member platform’s visible identity is now **Pacecraft**. The new symbol is a clean forward-moving path mark with a citrus signal point; the compact launcher icon uses the same geometry. The assets are used across sign-in, member/admin navigation, browser/PWA metadata, the install prompt, and email. The server project title and outgoing email sender default are also Pacecraft. Old Kinetiq launcher artwork has been removed. Payment-provider reference strings and cache namespaces that remain are internal integration identifiers, not app branding, and were not renamed to avoid breaking existing contracts.

The previous Rosewood/claret palette was replaced with **Evergreen, Ivory & Citrus**: forest `#174D43`, dark green `#132F2A`, warm ivory `#F7F4EA`, ink `#192723`, and citrus `#C5DF55`. These colors now define the shared member, authentication, admin, wallet, referral and public-entry styling. Semantic success, warning and error states remain distinct.

The public marketing landing page remains removed: guests at `/` see sign-in/create-account, while authenticated members go to the dashboard. `/login` continues to work; the PWA starts at `/`. The service-worker cache version has advanced and precaches the current Pacecraft mark and icon, while clearing old AdPulseAI and Kinetiq shell caches.

## Workspace changes

- **Dashboard:** Removed the exact account-overview/verified-data hero and active-plan card the user objected to. Removed duplicate deposit/withdrawal balances as well; the dashboard now opens with task earnings, period totals, task activity and the in-flow install card, using server-sourced history.
- **Wallet:** The dedicated Money Desk at `/payments` is now the only member home for deposit and withdrawal balances. It shows server profile balances, wallet actions, earnings breakdown and real payment history. Deposit funds and cashable payout earnings stay separate; action status language remains faithful to server/admin-review stages.
- **More:** “More” is a normal member route rather than a transient popover. Its grouped destinations are available at phone and desktop widths. The static route manifest now includes `/more`.
- **PWA and email:** The manifest and browser theme use evergreen; generated launcher sizes are optimized. Withdrawal and password-reset messages now use the Pacecraft mark and matching forest/ivory treatment. The reset logo is inline PNG with the updated attachment path/content type.

## Preserved behavior

Registration remains phone/email/password, with the referral code optional. Auth token ordering, authentication guards, server API routes, plan eligibility, payments, payout/recharge review, account setup, task timing/reward integrity and notification ownership were not changed in this follow-up. The wallet uses existing profile, dashboard and payment-history endpoints; it adds no financial write behavior.

## Verification

- `npm run build`: **passed** (TypeScript and Vite production build; route-level lazy loading remains enabled).
- Focused ESLint on the modified routing, shell, dashboard, wallet and login modules: **passed**.
- Backend regression suite: **39 passed, 1 skipped**, using in-memory SQLite and a disposable test-only JWT secret. Existing Pydantic/FastAPI deprecation warnings remain.
- Isolated Chromium regression suite: **passed** for guest/authenticated root routing, registration payload shape, hero/balance removal, seven-point earnings history, a dedicated More route, dedicated live wallet balance display, plans, referrals, 390px/320px layouts, tablet install, recharge final review, payment-history review status, duplicate-payout blocking and withdrawal-account dialog.
- **64 API requests were intercepted by local fixtures**; no live API requests, external requests, account writes or payout submission occurred. The mock fixture covers the existing deposit review path only. No browser JavaScript exceptions or console errors were reported.
- Manifest and all referenced icons resolve; the service-worker shell precache URLs resolve to files in `public`. `git diff --check` is required again before commit.

## Name availability and release status

Public-web screening was saved in [`brand-name-check.md`](../brand-name-check.md) while comparing name candidates. Search checks are not legal advice, domain availability confirmation or trademark clearance; **Pacecraft still needs a formal trademark/domain review before broader commercial launch**.

These changes are prepared for the already-authorized `main`-branch push. The earlier Vercel deployment was verified, but this new set of visual assets and wallet/More changes must not be described as live until its own deployment is confirmed. Azure readiness should be verified independently; this browser suite is local and does not establish production API readiness.
