# PACECRAFT frontend redesign handoff

**Branch:** `redesign/pacecraft-visual-audit` (local review branch; not pushed)

**Deployment:** Not deployed. Changes are in the sandbox checkout.

## Change summary

- Consolidated the shared palette into Harbor Blue / Warm Copper tokens, neutral surfaces, consistent typography, focus states, reduced-motion handling, and more readable shared controls.
- Added a dedicated `src/auth.css` for the desktop sign-in split layout and mobile form-first layout. Added contrast-matched light and dark Pacecraft marks and new palette-aligned PWA launcher icons without overwriting the original artwork.
- Aligned Tailwind and PWA theme metadata with the new system, versioned the service-worker cache, and precached both logo variants.
- Improved the shared member/admin shell styling and small-text/touch-target sizing. Corrected the `/payments` page title to **Wallet**.
- Replaced the blank direct M-Pesa deep-link state with a recovery view that explains the missing payment context and safely returns the user to Add funds. No payment action is started from that state.

## Pages reviewed

A read-only route and visual pass on the live preview covered sign-in, dashboard, tasks, wallet, payment history, referrals, plans, training, settings, Add funds, payout, and M-Pesa. No deposit, withdrawal, purchase, settings save, or other financial/account mutation was submitted. The Admin shell and its shared styles were reviewed in source; authenticated Admin routes were not end-to-end tested.

## Validation

- `npm run build` — passes (TypeScript and Vite production build).
- `git diff --check` — passes.
- No test script is configured in `package.json`.
- `npm run lint` — still reports **42 errors and 5 warnings**, the same count recorded on the unmodified baseline. Findings are pre-existing lint debt, primarily `any` types and hook-order/dependency checks.

## Outstanding gaps

- The local browser was available at its default 1280×1100 viewport; the authored phone breakpoints were not captured at a true handset viewport. They should receive a device-width visual check before release.
- Several live member routes showed loading/empty states or did not expose stable backend records during the read-only review. Their API-backed populated states should be checked in a staging environment with a representative test account.
- Admin routes need a separate authorized Admin test account and end-to-end visual pass.
- This branch has not been pushed or deployed. No changes were made to backend behavior or API contracts.
