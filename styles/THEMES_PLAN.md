# Style Themes Plan

## Goals

- Provide a modular, reusable theming system for `examples/features.html` and other outputs.
- Separate concerns: color tokens, base typographic/layout styles, and decorative modules.
- Make it easy to add new themes and switch themes at runtime.

## Principles

- Semantic tokens: use names like `--color-bg`, `--color-text`, `--color-accent` instead of direct colors.
- Composition: base styles + theme token maps + optional decorative modules.
- Low friction: themes should be plain CSS (custom properties) and a tiny JS switcher.
- Accessibility: ensure sufficient contrast and testable spacing.

## Deliverables

- Color token files for each theme (e.g., `themes/light.css`, `themes/dark.css`, `themes/sepia.css`).
- Base styles for fonts, spacing, reset and layout (`base/fonts.css`, `base/spacing.css`, `base/base.css`).
- Decorative modules (`decor/cards.css`, `decor/tables.css`, `decor/callouts.css`, `decor/checkboxes.css`).
- Tiny theme switcher script (`theme-switcher.js`).
- Documentation: `styles/README.md` (how to compose and apply themes).

## Suggested folder structure

styles/

- themes/
  - light.css
  - dark.css
  - sepia.css
- base/
  - base.css
  - fonts.css
  - spacing.css
- decor/
  - cards.css
  - tables.css
  - callouts.css
  - checkboxes.css
- theme-switcher.js
- THEMES_PLAN.md
- README.md

## Naming conventions

- Token names: `--color-<role>` (e.g., `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--color-border`).
- Spacing tokens: `--space-1`, `--space-2`, ... (use multiples of 4px or 8px scale).
- Type scale tokens: `--font-size-base`, `--font-size-lg`, `--font-size-sm`.

## Example token mapping

:root (base)

```
--color-bg: #fff;
--color-text: #111;
--color-surface: #f7f7f8;
--color-accent: #0066ff;
--color-border: #e3e6ea;
```

[data-theme="dark"]

```
--color-bg: #0b0d10;
--color-text: #e6eef8;
--color-surface: #121316;
--color-accent: #5aa1ff;
--color-border: #1f2328;
```

Use these tokens inside modules, e.g., `.md-root { background: var(--color-bg); color: var(--color-text); }`.

## Theme switching approach

- Add `data-theme` attribute to `<html>` or `<body>` (e.g., `<html data-theme="light">`).
- `theme-switcher.js` toggles attribute, writes selection to `localStorage`, and emits a DOM event for other scripts.

## Integration steps

1. Create base CSS and token files.
2. Implement decorative modules using tokens.
3. Add links to `examples/features.html` for base + chosen theme + decor modules.
4. Add `theme-switcher.js` and a small UI control (toggle/select) inside `examples/features.html` for demoing.

## Testing and QA

- Manual: visually compare `examples/features.html` under each theme.
- Automated (optional): add a script to render the page in headless Chromium and capture screenshots for diffs.

## Timeline / Milestones

- Phase 1 (1–2 days): Base styles and token system, light + dark themes.
- Phase 2 (1 day): Decorative modules and example integration.
- Phase 3 (half day): Theme switcher + docs + final tweaks.

---

If you'd like, I can scaffold the files, implement `light.css` and `dark.css`, add `theme-switcher.js`, and wire them into `examples/features.html` next — tell me which parts to start with.
