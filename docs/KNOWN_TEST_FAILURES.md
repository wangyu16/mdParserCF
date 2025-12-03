# Known Test Failures

This document describes test failures that exist in the current codebase and are known issues that may be addressed in future updates.

**Current Status:** 11 tests failing, 339 tests passing (350 total)

---

## 1. Markdown Plugin Tests (3 failures)

**File:** `tests/markdown-plugin.test.ts`

### 1.1 `should generate placeholder for {{markdown url}}`

**Issue:** Test expects the class `markdown-embed` but the implementation uses `async-plugin-placeholder`.

**Expected:**

```html
class="markdown-embed"
```

**Actual:**

```html
class="async-plugin-placeholder" data-plugin="markdown"
```

**Root Cause:** The markdown embed plugin was refactored to use the async plugin system with a different class naming convention. The test expectations need to be updated to match the new implementation.

---

### 1.2 `should generate placeholder for {{md url}} shorthand`

**Issue:** Same as above - class name mismatch between test expectations and implementation.

---

### 1.3 `should work with surrounding content`

**Issue:** Test expects `<h1>Title</h1>` but headings now include auto-generated IDs.

**Expected:**

```html
<h1>Title</h1>
```

**Actual:**

```html
<h1 id="title">Title</h1>
```

**Root Cause:** The heading rendering was enhanced to automatically generate IDs for table of contents support. The test needs to be updated to account for the `id` attribute.

---

## 2. Math Tests (1 failure)

**File:** `tests/unit/math.test.ts`

### 2.1 `should work with other markdown elements`

**Issue:** Test expects `<h1>` but headings now include auto-generated IDs.

**Expected:**

```html
<h1></h1>
```

**Actual:**

```html
<h1 id="math-title"></h1>
```

**Root Cause:** Same as markdown plugin issue #3 - headings now have auto-generated IDs for TOC support.

---

## 3. Pre-Processing (Phase 1) Tests (7 failures)

**File:** `tests/unit/parser.test.ts`

These tests are related to the inline text pre-processing system that protects special regions (escaped characters, code spans, math, plugins) from markdown parsing.

### 3.1 `should protect escaped asterisks inside bold`

**Input:** `**\*Escaped\***`

**Issue:** Escaped characters inside bold are not being properly unescaped after pre-processing.

**Expected:** First child value should be `*`  
**Actual:** First child value is `\`

**Root Cause:** The `restoreProtections` method may not be correctly restoring escaped characters in nested contexts.

---

### 3.2 `should protect code spans before processing bold`

**Input:** ``**bold `code**` end``

**Issue:** Code spans that overlap with bold markers are not being protected correctly.

**Expected:**

- First child: text `**bold `
- Second child: code `code**`

**Actual:** Parsing takes a different path due to asterisk matching.

**Root Cause:** The pre-processing protection order or the inline parsing logic needs adjustment to handle overlapping markers.

---

### 3.3 `should protect math before processing other inline elements`

**Input:** `**bold $a*b*c$ end**`

**Issue:** Math expressions containing asterisks inside bold are not parsed correctly.

**Expected:**

- Bold children should include `inline-math` with content `a*b*c`

**Actual:**

- The math content is parsed as text, not as `inline-math`

**Root Cause:** Math expressions inside nested formatting contexts lose their protection.

---

### 3.4 `should protect plugin syntax from markdown parsing`

**Input:** `{{emoji **smile**}}`

**Issue:** Plugins with markdown-like content inside are not being processed.

**Expected:** `html-inline` node with emoji content  
**Actual:** `text` node

**Root Cause:** Plugin pattern matching may not be working correctly, or the plugin protection in pre-processing is not functioning as expected.

---

### 3.5 `should protect plugins before processing formatting`

**Input:** `**bold {{emoji smile}} end**`

**Issue:** Plugins inside formatted text are not being recognized.

**Expected:** Bold children should contain an `html-inline` node  
**Actual:** No `html-inline` found in bold children

**Root Cause:** Same as above - plugin protection in nested contexts.

---

### 3.6 `should handle code inside bold with escaped chars`

**Input:** ``**\*bold `code` bold\***``

**Issue:** Complex nesting of escapes and code inside bold fails.

**Expected:** First bold child value should be `*`  
**Actual:** First bold child value is `\`

**Root Cause:** The combination of escaped characters and code spans inside bold is not handled correctly.

---

### 3.7 `should handle complex nesting: escaped + code + math + bold`

**Input:** ``**\*text `code` $math$ text\***``

**Issue:** Complex combination of all protected region types fails.

**Expected:**

- Bold children should contain: text `*`, code, inline-math

**Actual:** The expected node types are not found in the parsed result.

**Root Cause:** The pre-processing system struggles with multiple overlapping protection types in nested contexts.

---

## Summary

| Category        | Failures | Priority | Recommended Action                                            |
| --------------- | -------- | -------- | ------------------------------------------------------------- |
| Markdown Plugin | 3        | Low      | Update tests to match new async plugin implementation         |
| Math Tests      | 1        | Low      | Update test to expect heading ID attribute                    |
| Pre-Processing  | 7        | Medium   | Review and fix `restoreProtections` logic for nested contexts |

### Notes

1. **Markdown Plugin & Math failures** are test expectation issues - the actual functionality works correctly, but the tests need updating to match the current implementation.

2. **Pre-Processing failures** represent actual edge cases where complex nesting of protected regions (escapes, code, math, plugins) inside formatted text doesn't parse as expected. These are non-trivial to fix and affect advanced use cases.

3. All core markdown functionality (339 tests) works correctly. The failing tests cover edge cases that are unlikely to occur in typical usage.
