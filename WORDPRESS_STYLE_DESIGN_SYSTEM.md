# PACECRAFT dark glass visual system

## Current design decision

This document supersedes the earlier WordPress-inspired light/neutral proposal. The active direction is based on the user's supplied visual reference: a premium, futuristic dark glass workspace with deep navy surfaces, luminous cyan-to-blue-to-violet controls, translucent panels, and floating luminous geometry. It is a visual system for PACECRAFT's real learning, work, payment, account, and operations features; unrelated financial-market copy or content from the reference must not be imported.

The change is presentation-only. Preserve all existing route paths, authentication, API contracts, permissions, calculations, query and mutation behavior, form schemas, validation, analytics, and persistence.

## Semantic color tokens

| Token | Value | Primary use |
|---|---|---|
| Canvas | `#05121B` | App background and browser/PWA chrome |
| Midnight | `#0F1D38` | Deeper blue panels and background depth |
| Primary cyan | `#18D2C5` | Focus, progress, active details, secondary highlights |
| Turquoise | `#15E5C9` | Luminous accent and ambient spheres |
| Royal blue | `#4372DE` | Gradient transition and secondary actions |
| Indigo | `#4B52D5` | Primary gradient midpoint/depth |
| Violet | `#9959E4` | Spectral highlight and selected admin accents |
| Magenta | `#C24FD4` | Sparing glow and small decorative accents |
| Main text | `#F3F7FF` | Headings and high-priority content |
| Secondary text | `#C0CEE3` | Body copy, labels, and table data |
| Muted text | `#9CB0C8` | Helper text and supporting metadata |
| Glass border | `rgba(183, 197, 225, 0.43)` | Fine luminous panel edge |
| Glass surface | `rgba(11, 25, 43, 0.76)` | Translucent cards and panels |
| Strong glass | `rgba(8, 21, 37, 0.91)` | Dense, high-readability work surfaces |

Use the shared `--gradient-primary` and `--gradient-spectrum` tokens rather than inventing new gradients per page. Semantic success, warning, and danger colors remain distinct and readable on the dark canvas.

## Layout and surfaces

Keep the established member and admin application frames, sidebars, utility bars, responsive navigation, and route-specific content. Do not force all pages into the reference's three-panel composition. Apply glass treatment to sidebars, topbars, cards, forms, dialogs, and floating controls. Keep dense tables, task rows, and forms sufficiently opaque for sustained reading.

Create atmosphere with lightweight CSS radial gradients and thin luminous rings behind content. Keep ornamental geometry non-interactive and out of the reading order. Use restrained blur and shadows, visible but thin borders, and generous enough contrast between headings, body text, controls, and translucent surfaces.

Primary actions use a turquoise-to-blue-to-indigo gradient, strong readable text, visible keyboard focus, and clear hover/disabled states. Inputs use dark inset surfaces with persistent labels, readable placeholders, and a luminous focus ring. Status still uses text or icons in addition to color.

## Responsive behavior and accessibility

Preserve the existing responsive content hierarchy: desktop member/admin sidebars remain usable, narrower screens use the project's established drawer/navigation behavior, and cards/forms stack without forcing the reference's desktop layout. Avoid horizontal overflow at 390px and retain bounded table behavior where necessary.

Keep a minimum 2px visible focus indicator with strong contrast, keyboard-accessible navigation and dialogs, persistent form labels, semantic status text, and usable touch targets. Honor `prefers-reduced-motion`; any ambient animation is decorative, slow, and disabled for reduced-motion users. Use the project's existing Inter/system sans stack and preserve its established typography scale.

## Implementation and verification

Centralize foundational colors, glass values, gradients, borders, focus rings, and shadows in shared tokens. Apply shared reference styling to auth, member/admin shells, task player, referrals, forms, tables, dialogs, buttons, notices, and PWA surfaces while leaving business logic untouched. Keep original artwork; create separate gradient logo and dark launcher variants for this theme.

Verify the production build, compare lint findings to the existing baseline, parse active CSS, check palette and asset references, and render at desktop and phone widths. Before production deployment, also verify API-populated member pages and the separate admin experience in staging with authorized representative accounts.
