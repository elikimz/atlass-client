# AdPulse Classic Admin

## Design decision

The recommended direction for AdPulseAI is **AdPulse Classic Admin**: a professional WordPress-inspired system that combines the semantic discipline of WordPress Core, the polished workspace model of modern WordPress admin themes, the focused settings anatomy of WooCommerce Admin, and the responsive shell structure of AdminLTE 4.

This is not a literal copy of WordPress. The useful pattern is a stable application frame with a predictable sidebar, compact utility header, clear page context, restrained neutral surfaces, one primary accent, functional cards, and dense but readable data views.

The redesign must remain presentation-only. It must not change route paths, API contracts, permissions, calculations, query behavior, form schemas, mutation handlers, validation rules, analytics events, or database behavior.

## Full product experience

### 1. Login and authentication

The login screen should be quiet and trustworthy rather than promotional. Use a centered, narrow authentication surface on a neutral canvas, with the logo, product name, one clear heading, persistent labels, correctly typed inputs, visible password control, a single primary action, and concise recovery/help links. Keep validation text directly associated with the affected field and provide a summary for submit failures. Loading, expired-session, and server-error states should preserve entered values where safe and announce status accessibly.

The login page should not use a large decorative gradient, excessive illustration, animated background, or multiple competing calls to action. The user should immediately understand how to sign in and how to recover access.

### 2. User-side workspace

The user workspace uses a light 248px sidebar on desktop, a 56px utility header, and a fluid content region capped at approximately 1280px. The sidebar contains concise task-based destinations: Dashboard, My Tasks, Plans, Invite, Training, Payments, and Settings. The active destination uses a clear background and marker, not color alone. The utility header contains notifications, theme control, account context, and the user menu.

At mobile widths, the sidebar becomes an overlay drawer with a scrim, Escape dismissal, focus return to the menu button, and a visible page title. It must not become a permanently compressed icon-only rail that hides labels.

### 3. Admin workspace

The admin workspace uses a visually distinct dark 248px rail to signal administrative context. It contains grouped links for Dashboard, Video Tasks, Training, Users, Payments, Plans, Invites, and Notifications. The rail should not become a second dashboard; it is for navigation only. Page-specific actions belong in the page header or workspace toolbar.

The admin utility header remains compact and contains the sidebar toggle, page context, View User Site, theme control, notifications if needed, and the signed-in admin menu. Every admin page has a clear H1, optional breadcrumb, one primary action, and a focused content surface.

### 4. User-site preview

The existing admin View User Site action should continue to open the user-facing experience in a separate tab and must render the user shell, not the admin shell. This is a presentation concern only; it must not impersonate another user, alter account data, or change permissions.

## Visual tokens

Use semantic CSS variables rather than page-level hex values. The following values are the recommended starting contract.

| Token | Light | Dark |
|---|---:|---:|
| Canvas | `#f0f0f1` | `#1d2327` |
| Surface | `#ffffff` | `#23282d` |
| Subtle surface | `#f6f7f7` | `#2c3338` |
| Main text | `#1d2327` | `#f0f0f1` |
| Secondary text | `#3c434a` | `#c3c4c7` |
| Muted text | `#50575e` | `#a7aaad` |
| Border | `#c3c4c7` | `#50575e` |
| Primary | `#2271b1` | `#72aee6` |
| Primary hover | `#135e96` | `#8cc1ef` |
| Primary soft | `#e7f3ff` | `#193b5a` |
| Focus | `#3858e9` | `#8ab4f8` |
| Success | `#067a2f` | `#68de7c` |
| Warning | `#8a4b00` | `#f0c36a` |
| Danger | `#b32d2e` | `#f27575` |

Use a 4px spacing base: 4, 8, 12, 16, 20, 24, 32, 40, 48, and 64px. Use 24px desktop page gutters and 16px mobile gutters. Use 20–24px card padding, 12px control gaps, 16px form-field gaps, and 32px section gaps.

Use 4px as the default radius for controls, cards, forms, and notices. Use 8px only for dialogs, drawers, and larger composite surfaces. Use pill radii only for compact status chips. Cards use a 1px border and a very light shadow; stronger elevation is reserved for menus, popovers, and dialogs.

## Typography

Use a familiar system UI stack:

```css
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans,
Ubuntu, Cantarell, "Helvetica Neue", sans-serif
```

Keep the root at 16px so browser zoom and user preferences work correctly. Use this scale:

| Use | Size / line height | Weight |
|---|---:|---:|
| Compact metadata | 12px / 16px | 400–500 |
| Labels and helper text | 13px / 18px | 500 |
| Dense controls and table cells | 14px / 20px | 400–500 |
| Body copy | 16px / 24px | 400 |
| Card and section headings | 18px / 26px | 600 |
| Page support heading | 22px / 28px | 600 |
| Page H1 | 28px / 36px | 600 |
| Exceptional KPI | 32px / 40px | 600–700 |

Use sentence case rather than all caps. Use `font-variant-numeric: tabular-nums` for currency, percentages, counts, dates, and table values. Align numeric columns to the right and retain visible currency/unit context.

## Page templates

### Dashboard

Use one H1, a short welcome/context line, a date-range control, and up to four decision-critical KPI cards. Each KPI must show a value, unit, period, comparison or supporting context, and a meaningful next action where relevant. Follow with a trend/task area and recent activity or system status. Avoid a wall of colorful decorative charts.

### Plans

Use a focused H1 and one primary plan action. Show current plan/status in one summary surface, then show plan comparison or plan controls in grouped cards. Make price, validity, task limits, return, profit, and consequences explicit. Preserve all existing purchase, upgrade, and permission logic.

### Tasks

Use a data-workspace layout: H1, create/primary action, search, filters, view/column controls when supported, and a visible selection/bulk-action bar. Prioritize task name, plan, status, reward, owner, and last update. Use a responsive row/card presentation on narrow screens. Keep Intern-only and General task semantics unchanged.

### Payments

Place date range and payment status filters beside the H1. Follow with summary metrics, then a sortable/searchable table with date, reference, account, amount/currency, status, and action. Align amounts numerically and show failure reasons in the detail view rather than hiding them behind hover.

### Forms and settings

Use a breadcrumb, H1, and one Save action. Center focused forms at approximately 720px. Group one coherent idea per bordered card. Every input gets a visible label, correct input type, helper text, required/optional state, and inline validation. Never use placeholder text as the only label and never duplicate Save buttons.

### Data tables

Treat table, list, and mobile cards as views of one data model. Toolbar order should be search, primary filters, view/column controls, export, and overflow. Support sortable headers, visible sort state, pagination, selection, bulk actions, loading, empty, no-results, and error states. Keep headers associated with cells and preserve row context.

## Responsive behavior

- At 1200px and above: full sidebar, full page header, multi-column content, and complete table controls.
- From 768px to 1199px: sidebar rail or drawer, wrapped filters, stacked card columns, and visible H1/primary action.
- Below 768px: modal navigation drawer, stacked forms/cards, compact utility actions, and prioritized data rows.
- At 320px and 200% zoom: no page-level horizontal scrolling; bounded table scrolling is acceptable only when two-dimensional comparison is essential.
- Do not use fixed heights for cards, notices, rows, or form regions. Content must wrap and grow.

## Accessibility rules

Target WCAG 2.2 AA. Each route gets one descriptive H1, semantic navigation/main landmarks, visible focus, keyboard-operable menus/dialogs, persistent labels, associated helper/error text, and live announcements for asynchronous saves and mutations. Use text or icons in addition to color for status, selection, trend, and errors. Preserve a 2px focus ring with sufficient contrast. Honor reduced-motion preferences. Test keyboard-only use, screen readers, 200% zoom, 320px width, dark/light mode, forced colors, long labels, loading/empty/error states, and mobile drawer focus behavior.

## What to remove or avoid

Do not use decorative gradients, glassmorphism, saturated full-card KPI blocks, nested card stacks, heavy shadows, fixed-height content, tiny icon-only controls, ambiguous Edit/More labels, hover-only information, placeholder-only labels, or color-only statuses. Do not copy WordPress’s legacy 13px-only base or fixed desktop assumptions. Do not add new top-level navigation items when an existing category is appropriate. Do not change business logic, routes, API payloads, permissions, calculations, persistence, or validation during the visual migration.

## Non-invasive implementation sequence

1. Inventory all existing routes, shells, repeated controls, tables, forms, dialogs, and visual tokens.
2. Introduce the semantic token layer and theme contract.
3. Migrate login and shared user/admin shells, including focus and mobile drawer behavior.
4. Migrate buttons, inputs, notices, cards, tables, dialogs, and page headers as presentation primitives.
5. Apply templates to one dashboard, one task table, one payment table, and one form before migrating the remaining pages.
6. Compare route behavior, API calls, permissions, filters, mutations, validation, and errors before and after each migration.
7. Run light/dark, desktop/mobile, keyboard, zoom, and accessibility checks before removing compatibility styles.

## Research sources

- [WordPress typography](https://developer.wordpress.org/themes/global-settings-and-styles/settings/typography/)
- [WordPress color](https://developer.wordpress.org/themes/global-settings-and-styles/settings/color/)
- [WordPress spacing](https://developer.wordpress.org/themes/global-settings-and-styles/settings/spacing/)
- [WordPress Admin UI package](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-admin-ui/)
- [WordPress Components package](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-components/)
- [WordPress DataViews](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/)
- [WordPress accessibility guidance](https://developer.wordpress.org/block-editor/how-to-guides/accessibility/)
- [WordPress Admin Design](https://make.wordpress.org/core/2023/07/12/admin-design/)
- [UIXpress](https://www.uipress.co/)
- [WooCommerce Admin settings anatomy](https://developer.woocommerce.com/2026/07/08/unifying-extension-settings-in-woocommerce/)
- [WooCommerce Admin navigation](https://developer.woocommerce.com/registering-with-woocommerce-admin-navigation/)
- [WooCommerce navigation deprecation](https://developer.woocommerce.com/2024/11/14/feature-deprecation-woocommerce-navigation/)
- [WooCommerce Analytics](https://woocommerce.com/document/woocommerce-analytics/)
- [AdminLTE 4 documentation](https://adminlte.io/docs/4.0/index.html)
- [AdminLTE layout](https://adminlte.io/themes/v4/docs/layout.html)
- [Bootstrap typography](https://getbootstrap.com/docs/5.3/content/typography/)
- [Bootstrap accessibility](https://getbootstrap.com/docs/5.3/getting-started/accessibility/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Decision

Use **AdPulse Classic Admin** as the single design direction. It is cleaner and more professional than the current ornamental card-heavy treatment while retaining the familiar WordPress mental model. Implement it as a staged presentation migration only after approval of this direction; do not mix it with business-rule changes.
