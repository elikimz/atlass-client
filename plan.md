# PACECRAFT Reference-Driven Redesign Plan

## Product scope
Redesign the existing PACECRAFT frontend to match the user's supplied reference screenshot as closely as practical. Treat the reference as the primary visual source, but preserve PACECRAFT's real content, route structure, API integration, authentication, and business actions. Do not transplant the reference's unrelated payment or stock-trading copy into the product.

## Existing project structure
- `src/App.tsx`: member and admin route definitions, authentication gates, and route-level loading.
- `src/pages/`: member dashboard, tasks/task player, training, plans, referrals, payments, settings, and admin pages.
- `src/components/`: member/admin shells, navigation, notification controls, PWA controls, and shared feature components.
- `src/index.css`, `src/member-redesign.css`, `src/auth.css`, `src/pages/TaskPlayer.css`, `src/components/ReferralNetwork.css`, and `src/pwa.css`: global, shell, auth, task, network, and PWA styles.
- `public/assets/`, `public/manifest.webmanifest`, `public/sw.js`, and `index.html`: site and installable-app brand assets and metadata.

## Design direction
- **Design movement:** premium futuristic glassmorphism, adapted from the supplied dark financial-interface reference for a skills-and-work platform.
- **Core principles:** dark navy foundation; luminous cyan-to-blue-to-violet gradients; translucent frosted-glass surfaces; restrained ambient geometry; dense content remains readable and functional.
- **Color philosophy:** make the reference's deep near-black navy feel immersive, then use turquoise/cyan for momentum, royal blue and violet for depth, and a small amount of magenta for spectral glow. Use white headings and cool muted secondary text. Candidate tokens: navy `#05121B`, midnight blue `#0F1D38`, cyan `#18D2C5`, turquoise `#15E5C9`, royal blue `#4372DE`, blue-violet `#4B52D5`, violet `#9959E4`, and subtle magenta `#C24FD4`.
- **Layout paradigm:** retain the actual member/admin shells and existing information architecture. Apply the glass treatment to their sidebars, top bars, cards, dialogs, forms, and tables; do not force every route into the reference's three-card composition.
- **Signature elements:** CSS radial-gradient spheres and thin glowing rings behind content; translucent panels with pale luminous borders; turquoise-to-blue-to-violet primary controls.
- **Interaction philosophy:** keep all existing routes, links, data shapes, authentication, and mutations unchanged. Give focus, hover, active, loading, and disabled states the same luminous design language with strong accessibility cues.
- **Animation:** slow, restrained ambient drift only; no required motion for information or task completion; honor `prefers-reduced-motion` and avoid heavy assets.
- **Typography system:** preserve the product's current Inter/system sans stack. Use clear large page H1s, compact uppercase eyebrow labels, 18–24px section/card titles, 14–16px body copy, and 12–13px secondary metadata; keep numeric values tabular and supporting copy cool and muted.
- **Brand essence:** a focused workspace that turns learning into measurable progress; personality: energetic, credible, modern.
- **Brand voice:** direct, encouraging, practical. Example headline: “Make room for your next big move.” Example CTA: “Continue your momentum.”
- **Wordmark & logo:** preserve the existing PACECRAFT mark and wordmark silhouette; recolor new copies with the reference's cyan/blue/violet spectrum on dark backgrounds.
- **Signature brand color:** luminous turquoise `#18D2C5`.

## Runtime, dependencies, and constraints
The site is the existing React/TypeScript single-page frontend served by Vite, with routes and authentication handled by `src/App.tsx` and `src/main.tsx`. Existing API calls remain in the frontend service layer and continue to target the current backend; this redesign adds no backend service, API, or database dependency. The member/admin route structure, current React/CSS/Tailwind/Vite packages, and PWA service-worker architecture are retained. Decorative effects use CSS gradients and existing local brand artwork; new logo/icon variants are local assets. Preserve current authentication and financial workflows, responsive behavior, API data shape, and accessibility constraints.

## Implementation approach
1. Replace the prior light palette with reusable dark/glass/gradient tokens and align Tailwind, browser metadata, manifest, and service-worker cache version.
2. Migrate the retained CSS literals by declaration context so dark text becomes readable light text, pale card surfaces become glassy midnight surfaces, and interactive accents follow the reference spectrum without changing business logic.
3. Add a shared reference-theme layer for the ambient spheres/rings, glass materials, readable dense-work surfaces, focus states, and consistent controls across member and admin routes.
4. Create non-destructive gradient logo and PWA-icon variants from existing artwork and point the app at them.
5. Validate the production build, lint status against the existing baseline, and desktop/mobile rendering in the local preview. Do not publish to production without explicit review and approval.
