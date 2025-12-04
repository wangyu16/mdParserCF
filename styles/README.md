# Styles / Theming Guide

==A Theme Forger has been created. This folder is not needed anymore. ==

This folder contains the modular theming system used by the `examples` output.

Overview

- `styles/base/base.css` — base tokens, reset, layout and core markdown element styles.
- `styles/themes/*.css` — theme token maps that set semantic CSS custom properties (e.g. `light.css`, `dark.css`, `sepia.css`).
- `styles/decor/*.css` — optional decorative modules (cards, tables, callouts, checkboxes) that adapt to the current token set.
- `styles/theme-switcher.js` — tiny runtime that toggles `data-theme` on `<html>` and persists choice.

Goals

- Use semantic tokens (CSS custom properties) so themes are simple maps of values.
- Keep base layout and typographic rules shared in `base.css`.
- Allow cosmetic modules to be mixed in without duplicating color or spacing values.

Token conventions

- Color tokens: `--color-bg`, `--color-text`, `--color-surface`, `--color-muted`, `--color-accent`, `--color-border`, `--color-success`, `--color-warning`, `--color-danger`.
- Spacing tokens: `--space-1`, `--space-2`, `--space-3`, `--space-4` (typically an 4px/8px scale).
- Type tokens: `--font-family-system`, `--font-size-base`, `--line-height-base`.

How themes work

- `base.css` defines defaults under `:root` and uses variables throughout `.md-root` and global element rules.
- Each theme file (for example `styles/themes/dark.css`) contains a selector that maps variables inside a theme scope:

```css
[data-theme='dark'] {
  --color-bg: #0b1220;
  --color-text: #e6eef8;
  --color-surface: #0f1724;
  --color-accent: #4ea8ff;
  --color-border: #1f2937;
}
```

Runtime theme switching

- The generator (`convert-md-to-html.js`) injects a small theme chooser and includes `styles/theme-switcher.js`.
- The switcher sets `data-theme` on the `<html>` element and stores the choice in `localStorage` under `mdparsercf:theme`.
- Supported values: `system`, or any explicit theme name present in the `<select>` (e.g. `light`, `dark`, `sepia`). `system` follows the OS `prefers-color-scheme`.

Integrating into generated HTML

- The generator currently links the styles relative to the generated file, e.g. in `convert-md-to-html.js` the head includes:

```html
<link rel="stylesheet" href="../styles/base/base.css" />
<link rel="stylesheet" href="../styles/themes/light.css" />
<link rel="stylesheet" href="../styles/themes/dark.css" />
<link rel="stylesheet" href="../styles/themes/sepia.css" />
<script src="../styles/theme-switcher.js"></script>
```

- If you generate HTML to other locations, update these paths accordingly.

Adding a new theme

1. Create `styles/themes/<name>.css` with a `[data-theme="<name>"]` block mapping variables.
2. Add a `<link rel="stylesheet" href="../styles/themes/<name>.css">` to the HTML generation head (update `convert-md-to-html.js`).
3. Add an `<option value="<name>">` to the theme chooser in `convert-md-to-html.js`.

Example: `styles/themes/sepia.css`

```css
[data-theme='sepia'] {
  --color-bg: #fbf5ea;
  --color-text: #3b2f2f;
  --color-surface: #fff8ef;
  --color-accent: #b35b00;
  --color-border: #e6d8c1;
}
```

Decorative modules

- Decor modules live in `styles/decor/`. They read tokens from the page and provide extra styles (cards, callouts, checkbox appearance, table refinements).
- To enable a decorative module in generated output, add a `<link>` to the module in the HTML head or bundle it into a single CSS file.

Best practices

- Prefer using tokens in all CSS instead of hard-coded colors.
- Keep `base.css` focused on layout, type and default tokens; keep theme files only as value maps.
- When adding colors, pick semantic names (accent, success, danger) rather than visual names.

Visual QA

- For manual checks, open `examples/features.html` and cycle through the theme selector.
- For automated checks, generate the page under each theme (set `localStorage` or simulate `data-theme`) and capture screenshots via headless Chrome for diffing.

Questions / Next steps

- I can: (A) add a small demo page that lists available themes and shows side-by-side screenshots; (B) add a simple screenshot script to `scripts/` that launches headless Chromium to capture the rendered `examples/features.html` under each theme. Which would you prefer?
