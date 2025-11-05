# Phase 1 Extensions - Implementation Guide

## Current Status ✅

### ✅ Completed
- **Phase 1 Core**: 68 tests passing (35 parser + 33 renderer)
- **Phase 1 Extension #1 - Tables (GFM)**: ✅ COMPLETE
  - Full GFM table syntax with alignment (left/center/right)
  - 18 tests added (9 parser + 9 renderer)
  - All 86 tests passing (100%)
  - Documentation: 5 files in constructionNotes/

### Current Test Results
```bash
$ npm test
✓ tests/unit/parser.test.ts (44 tests - 35 core + 9 tables)
✓ tests/unit/renderer.test.ts (42 tests - 33 core + 9 tables)
Tests  86 passed (86)
PASS ✅
```

---

## Parser Capabilities

### ✅ Fully Supported
- Headings: `# Title` (h1-h6)
- Emphasis: `*italic*`, `**bold**`, `***both***`
- Code: `` `code` ``, ` ``` `js` ` (fenced), indented
- Links: `[text](url)`, `[text](url "title")`
- Images: `![alt](url)`, `![alt](url "title")`
- Lists: `- item` (unordered), `1. item` (ordered)
- Blockquotes: `> quote`
- Horizontal rules: `---`, `***`, `___`
- Escaping: `\*`, `\[`, `\\`, etc.
- **Tables (GFM)** ✅: `| Header | ... | --- | ... | Cell |` with `:---` / `:-:` / `---:` alignment

### ⏳ Coming Next
- Strikethrough (`~~text~~`)
- Footnotes (`[^1]`)
- Custom containers, underline, highlight, etc.

---

## ✅ Example: Tables (COMPLETED)

See `TABLES_IMPLEMENTATION.md` for complete implementation details.

**What was done**:
1. ✅ Added `Table`, `TableRow`, `TableCell` types to ast-types.ts
2. ✅ Implemented `parseTable()` and 3 helper methods in parser.ts
3. ✅ Added table detection in `parseBlock()` method
4. ✅ Renderer already had full table support
5. ✅ Added 9 comprehensive parser tests
6. ✅ Added 9 comprehensive renderer tests
7. ✅ All 86 tests passing (100%)

**Key implementation details**:
- Detects tables by pipe character (`|`)
- Validates separator row format (`:---`, `:-:`, `---:`)
- Extracts alignment from separator syntax
- Supports inline markdown within cells
- Generates semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- Applies CSS `style="text-align:..."` for alignment

---

## 📋 Next: Strikethrough (Phase 1 Extension #2)

## 📋 Next: Strikethrough (Phase 1 Extension #2)

**Status**: Ready to implement  
**Estimated Time**: 30-45 minutes  
**Pattern**: Inline element (similar to emphasis/bold)

### Implementation Plan

1. **Verify AST Type** in `src/parser/ast-types.ts`:
   - Check if `Strikethrough` interface exists
   - Should have: `type: 'strikethrough'` and `children: InlineNode[]`

2. **Add Parsing Logic** in `src/parser/parser.ts` → `parseInline()` method:
   ```typescript
   // Add before other inline patterns
   if (text[i] === '~' && text[i + 1] === '~') {
     const closingIndex = text.indexOf('~~', i + 2);
     if (closingIndex !== -1) {
       const content = text.slice(i + 2, closingIndex);
       nodes.push({
         type: 'strikethrough',
         children: this.parseInline(content),
       });
       i = closingIndex + 1;
       continue;
     }
   }
   ```

3. **Add Renderer** in `src/renderer/html-renderer.ts`:
   ```typescript
   // Add to renderInline() case statement
   case 'strikethrough':
     return this.renderStrikethrough(node as Strikethrough);
   
   // Add new method
   private renderStrikethrough(node: Strikethrough): string {
     const content = node.children
       .map((child) => this.renderInline(child))
       .join('');
     return `<del>${content}</del>`;
   }
   ```

4. **Add Tests** in `tests/unit/parser.test.ts`:
   - Basic strikethrough: `~~text~~`
   - Nested formatting: `~~**bold** text~~`
   - Edge case: unclosed `~~text` (should NOT parse)
   - Multiple on line: `~~first~~ and ~~second~~`

5. **Add Tests** in `tests/unit/renderer.test.ts`:
   - `<del>` tag generation
   - Nested HTML rendering
   - Multiple strikethrough on one line

6. **Verify**:
   ```bash
   npm test
   # Should see increased test count with all passing
   ```

### Strikethrough Syntax

```markdown
This is ~~strikethrough~~ text.
Mix with **~~bold strikethrough~~**.
Multiple: ~~first~~ and ~~second~~.
```

Renders to:

```html
<p>This is <del>strikethrough</del> text.</p>
<p>Mix with <strong><del>bold strikethrough</del></strong>.</p>
<p>Multiple: <del>first</del> and <del>second</del>.</p>
```

---

## 🛠️ Code Structure Reference

### Enable AST Debugging
```typescript
const parser = new Parser({ debugAST: true });
const ast = parser.parse(markdown);
console.log(JSON.stringify(ast, null, 2)); // Full AST dump
```

### Debug Specific Parser Methods
```typescript
// Use parseInline() directly
const inlineNodes = parser.parse('Some **bold** text').children[0].children;
console.log(inlineNodes);
```

### Check Rendered HTML
```typescript
const renderer = new HTMLRenderer();
const html = renderer.render(ast).html;
console.log(html); // View generated HTML
```

### Run Specific Tests
```bash
npm test -- parser.test.ts              # Parser tests only
npm test -- renderer.test.ts            # Renderer tests only
npm test -- --reporter=verbose          # Verbose output
```

---

## Common Issues & Solutions

### Issue: Parsing not working for new element
**Check**: 
1. Is it in `parseBlock()` or `parseInline()`?
2. Is the check added BEFORE the default paragraph?
3. Does the regex match the intended syntax?

### Issue: Element renders but not escaped
**Check**:
1. Is text going through `escapeHtml()`?
2. Is it in a `case` statement that returns without rendering children?

### Issue: Test fails but parsing works manually
**Check**:
1. Are you comparing the right node type?
2. Is the test checking `.children[0]` vs `.children[n]`?
3. Are blank lines creating unexpected paragraphs?

---

## Performance Considerations

- Parser uses **linear time** algorithm (single pass)
- HTML renderer is **single-pass** (no backtracking)
- For 10KB documents: ~5ms parse + ~1ms render

**Optimization opportunities**:
- Cache regex patterns
- Lazy evaluate children when not needed
- Stream rendering for large documents

---

## Testing Checklist for New Features

When adding a new element:

- [ ] Parser test: basic syntax
- [ ] Parser test: with nested formatting
- [ ] Parser test: edge case (unclosed, malformed)
- [ ] Renderer test: produces correct HTML
- [ ] Renderer test: escapes HTML properly
- [ ] Renderer test: preserves child content
- [ ] Run all tests: `npm test` (should be 100% pass)
- [ ] Check TypeScript: `npm run build` (no errors)

---

## Next Extensions Priority (After Strikethrough)

### High Priority (commonly used)
1. ✅ **Tables** - GFM standard, widely used - COMPLETE ✅
2. ⏳ **Strikethrough** - GFM standard - NEXT
3. ⏳ **Better list nesting** - Edge case handling

### Medium Priority (useful)
4. **Footnotes** - CommonMark extension
5. **Math** - Academic writing
6. **Custom containers** - Special blocks

### Lower Priority (advanced)
7. **Plugins** - Extensibility
8. **HTML pass-through** - Advanced users
9. **Syntax highlighting** - Code rendering

---

## Files to Modify for Phase 1 Extensions

```
src/
├── parser/
│   ├── ast-types.ts          ← Add node types
│   ├── parser.ts             ← Add parsing logic
│   └── precedence.ts         ← Add rules if needed
├── renderer/
│   └── html-renderer.ts      ← Add rendering logic
└── index.ts                  ← Export new types if public

tests/unit/
├── parser.test.ts            ← Add parser tests
└── renderer.test.ts          ← Add renderer tests
```

---

## Useful Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- parser.test.ts

# Build for production
npm run build

# Check TypeScript
npx tsc --noEmit

# Lint code
npm run lint

# Format code
npm run format

# See file structure
tree src -I node_modules
```

---

**Happy coding! Remember: TDD approach - write tests first, then implementation.**
