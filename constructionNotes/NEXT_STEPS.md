# 🗺️ Next Steps & Development Roadmap

**Current Status**: Phase 1 Extensions - 40% Complete (2/5 extensions)  
**Test Coverage**: 94/94 passing (100%) ✅  
**Code Quality**: 100% type-safe, zero linting errors ✅  

---

## 🎯 Immediate Next Steps (This Week)

### 1. Implement Footnotes (Extension #3) - 🔴 HIGH PRIORITY
**Time Estimate**: 3-4 hours  
**Complexity**: Medium  
**Impact**: Adds commonly-used academic feature  

#### Tasks:
```
[ ] Review footnote spec in markdownRenderRules.md (lines 11-X)
    Syntax: [^1] reference, [^1]: definition
    Features: Multi-paragraph, inline footnotes, reuse
    
[ ] Add/verify AST types in src/parser/ast-types.ts
    - Footnote interface (reference marker + id)
    - FootnoteDefinition interface (id + content)
    
[ ] Implement parsing in src/parser/parser.ts
    [ ] Add footnote reference detection in parseInline()
    [ ] Implement footnote collection phase
    [ ] Add parseFootnoteReference() method
    [ ] Add parseFootnoteDefinition() method
    
[ ] Implement rendering in src/renderer/html-renderer.ts
    [ ] Add renderFootnote() method (inline)
    [ ] Add renderFootnoteDefinition() method (footer)
    [ ] Handle footnote numbering/ordering
    
[ ] Write comprehensive tests (8-10 total)
    [ ] Basic footnote reference parsing (1 test)
    [ ] Footnote definition parsing (1 test)
    [ ] Multi-paragraph footnotes (1 test)
    [ ] Inline footnotes ^[content] (1 test)
    [ ] Footnote reuse (1 test)
    [ ] Nested markdown in footnotes (1 test)
    [ ] Footnote rendering (2 tests)
    [ ] Edge cases: unclosed, invalid ID (1 test)
    
[ ] Verify all tests pass: npm test
[ ] Update documentation:
    [ ] Create PHASE1_EXTENSION_3_COMPLETE.md
    [ ] Create FOOTNOTES_IMPLEMENTATION.md
    [ ] Update NEXT_STEPS.md
    [ ] Update PHASE1_EXTENSIONS.md
```

**Success Criteria**:
- All 102-104 tests passing (94 + 8-10 footnote tests)
- 100% pass rate maintained
- Zero TypeScript errors
- Documentation complete

---

### 2. Add Line Breaks (2 Spaces → `<br>`) - 🟡 MEDIUM PRIORITY
**Time Estimate**: 1 hour  
**Complexity**: Low  
**Impact**: Fixes markdown spec compliance gap  

#### Tasks:
```
[ ] Understand spec: Two or more spaces at end of line = line break
    Current: Spaces treated as part of text
    Needed: Detect "  \n" pattern and create break node
    
[ ] Modify src/parser/parser.ts
    [ ] Update parseParagraph() to detect trailing spaces
    [ ] Create break element in inline parsing
    
[ ] Update src/renderer/html-renderer.ts
    [ ] Add renderBreak() method returning `<br>`
    
[ ] Write tests (2-3)
    [ ] Basic line break (1 test)
    [ ] Multiple spaces (1 test)
    [ ] Break in paragraph vs separate paragraph (1 test)
    
[ ] Verify all tests pass: npm test
```

**Success Criteria**:
- All 96-97 tests passing
- Spec compliance improved
- Documentation updated

---

## 🗓️ This Month Roadmap (Week 2-3)

### 3. Reference-Style Links & Images - 🟡 MEDIUM PRIORITY
**Time Estimate**: 2-3 hours  
**Complexity**: Medium (requires link reference collection)  
**Impact**: CommonMark standard feature  

#### Pattern Recognition:
```markdown
[link text][ref-id]
[ref-id]: https://example.com "Optional title"

![alt][img-ref]
[img-ref]: image.png "Title"
```

#### Tasks:
- [ ] Implement reference definition collection phase
- [ ] Add ref lookup in link/image rendering
- [ ] Write 4-6 tests
- [ ] Update documentation

---

### 4. Auto-Links (`<url>` and `<email>`) - 🟡 MEDIUM PRIORITY
**Time Estimate**: 1-2 hours  
**Complexity**: Low  
**Impact**: CommonMark standard feature  

#### Pattern Recognition:
```markdown
<https://example.com> → <a href="https://example.com">https://example.com</a>
<user@example.com> → <a href="mailto:user@example.com">user@example.com</a>
```

#### Tasks:
- [ ] Add auto-link detection in parseInline()
- [ ] Add URL and email validation
- [ ] Add rendering methods
- [ ] Write 3-4 tests

---

### 5. Remaining Inline Styles - 🟡 MEDIUM PRIORITY
**Time Estimate**: 2-3 hours  
**Complexity**: Medium (syntax conflicts possible)  
**Impact**: Academic/scientific writing support  

#### Features to Add:
```markdown
++underline++      → <u>underline</u>
==highlight==      → <mark>highlight</mark>
^superscript^      → <sup>superscript</sup>
~subscript~        → <sub>subscript</sub>  (CONFLICTS with ~~strikethrough~~)
```

#### Subscript Conflict Solution:
- Option A: Use single `~` for subscript, require `~~` for strikethrough (current)
- Option B: Use different syntax like `~{subscript}` or `:subscript:`
- **Recommend**: Option A (already works for strikethrough)

#### Tasks:
- [ ] Add AST types: Underline, Highlight, Superscript, Subscript
- [ ] Implement parsing for each in parseInline()
- [ ] Add rendering methods in html-renderer.ts
- [ ] Write 4-6 tests
- [ ] Handle nesting and edge cases

---

## 📦 Phase 1 Extensions Summary (Next 1-2 Weeks)

| Extension | Status | Priority | Effort | Tests | Status |
|-----------|--------|----------|--------|-------|--------|
| Tables | ✅ Done | - | 3 hrs | 18 | Complete |
| Strikethrough | ✅ Done | - | 1 hr | 8 | Complete |
| **Footnotes** | ⏳ Next | 🔴 HIGH | 3-4 hrs | 8-10 | Ready |
| Line Breaks | ⏳ Next | 🟡 MED | 1 hr | 2-3 | Ready |
| Custom Containers | 📋 Planned | 🟡 MED | 2-3 hrs | 4-6 | Designed |
| Inline Styles | 📋 Planned | 🟡 MED | 2-3 hrs | 4-6 | Designed |
| **TOTAL PHASE 1** | | | ~14-16 hrs | 130-145 | 40% Done |

---

## 🎯 Phase 1 Completion (Next Month)

### Remaining Work
1. Footnotes (3-4 hrs)
2. Line breaks (1 hr)
3. Custom containers (2-3 hrs)
4. Additional inline styles (2-3 hrs)
5. Reference-style links/images (2-3 hrs)
6. Auto-links (1-2 hrs)
7. GitHub Actions CI/CD (2 hrs)
8. Final testing & polish (1-2 hrs)

**Total Remaining**: ~14-20 hours

### Target Timeline
- **This Week**: Footnotes + Line Breaks (4-5 hours)
- **Next Week**: Custom Containers + Inline Styles (4-6 hours)
- **Week 3**: Reference Links + Auto-Links (3-4 hours)
- **Week 4**: CI/CD + Polish (2-3 hours)

**Phase 1 Complete**: ~4 weeks total (1 week done, 3 weeks remaining)

---

## 📋 Before Starting Each Extension

### Checklist Template
```
[ ] Read spec section in markdownRenderRules.md
[ ] Review existing similar implementations
[ ] Verify AST types exist or create new ones
[ ] Design parser logic:
    [ ] Where to detect? (parseInline, parseBlock, etc)
    [ ] What delimiters/patterns?
    [ ] How to handle nesting?
    [ ] Edge cases?
[ ] Design rendering logic
[ ] Write test cases FIRST (TDD approach)
[ ] Implement parser code
[ ] Implement renderer code
[ ] Run tests: npm test
[ ] Run linting: npm run lint
[ ] Run type check: npm run type-check
[ ] Update documentation
[ ] Update CHECKLIST.md progress
[ ] Update PHASE1_EXTENSIONS.md
```

---

## 🧪 Testing Protocol for Extensions

### For Each Extension Feature:
```typescript
// 1. Basic functionality test
it('should parse [feature]', () => {
  const ast = parser.parse('[feature markdown]');
  expect(ast.children[0].type).toBe('expected-type');
});

// 2. Nested formatting test
it('should parse [feature] with nested formatting', () => {
  const ast = parser.parse('[feature with **bold** inside]');
  // Verify nested nodes are parsed
});

// 3. Multiple on same line test
it('should parse multiple [feature] on same line', () => {
  const ast = parser.parse('[feature1] text [feature2]');
  // Verify both found
});

// 4. Edge case - unclosed/invalid test
it('should handle unclosed [feature]', () => {
  const ast = parser.parse('[unclosed feature');
  // Should not crash, handle gracefully
});

// 5. Rendering test
it('should render [feature] correctly', () => {
  const html = mdToHtml('[feature markdown]');
  expect(html).toContain('<expected-tag>');
});

// 6. Security test
it('should escape HTML in [feature]', () => {
  const html = mdToHtml('[feature with <script>]');
  expect(html).not.toContain('<script>');
  expect(html).toContain('&lt;script&gt;');
});
```

---

## 🔄 Development Workflow

### For Each Work Session:
```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/[extension-name]

# 3. Run tests before changes
npm test

# 4. Make changes and test frequently
npm test -- --watch

# 5. Before committing, run full suite
npm test
npm run lint
npm run type-check
npm run format

# 6. Commit with descriptive message
git add .
git commit -m "feat: add [feature] support

- Implement parsing for [feature]
- Add rendering to [output]
- Add [N] tests
- All [N] tests passing"

# 7. Push and create PR
git push origin feature/[extension-name]
```

---

## 📊 Progress Tracking

### Weekly Update Template
```markdown
## Week [N] Progress

**Completed**:
- [x] Extension [X]: Feature completed
  - [x] Parsing implemented
  - [x] Rendering implemented
  - [x] [N] tests added
  - Tests: [current]/[total] passing

**In Progress**:
- [ ] Extension [Y]: Feature name
  - Status: [%] complete

**Planned**:
- [ ] Extension [Z]: Feature name
  - Estimated: [hours] hours, [N] tests

**Test Coverage**: [current]/[total] (100%)
**Code Quality**: [status]
**Blockers**: None / [specific blockers]

**Next Week**: [planned tasks]
```

---

## 🎓 Knowledge Base for Developers

### Key Files to Review Before Starting
- `src/parser/parser.ts` - Study existing parseInline() and parseBlock() methods
- `src/renderer/html-renderer.ts` - Review rendering patterns
- `tests/unit/parser.test.ts` - Study test structure
- `tests/unit/renderer.test.ts` - Review test patterns
- `bluePrint/markdownRenderRules.md` - Reference implementation

### Common Patterns

#### Adding a New Inline Element:
1. Add type to `ast-types.ts`
2. Add detection in `parseInline()` method
3. Add case to `renderInline()` method
4. Add parser test + renderer test
5. Run tests: `npm test`

#### Adding a New Block Element:
1. Add type to `ast-types.ts`
2. Add detection in `parseBlock()` method
3. Add case to `renderBlock()` method
4. Add parser test + renderer test

---

## ❓ FAQ for Extension Development

**Q: How do I handle nested formatting?**
A: Call `this.parseInline(content)` to recursively parse inline content inside your element.

**Q: What if my syntax conflicts with existing syntax?**
A: Review parsing precedence in `precedence.ts` or adjust detection order in `parseInline()`.

**Q: How do I test edge cases?**
A: Add test for: unclosed delimiters, nested structures, multiple on same line, empty content, special chars.

**Q: Should I update the AST types?**
A: Yes - always. Even if partially, add TODOs for future improvements.

**Q: Do I need to handle escaping?**
A: Yes - users should be able to escape with backslash (e.g., `\++not underline\++`).

---

## 📞 Documentation Updates Needed

### For Each Extension Completed:
1. Create `PHASE1_EXTENSION_[N]_COMPLETE.md` - Summary
2. Create `[FEATURE]_IMPLEMENTATION.md` - Technical details
3. Update `PHASE1_EXTENSIONS.md` - Mark complete, show example
4. Update `CHECKLIST.md` - Check off tasks
5. Update `README.md` - Add to features list
6. Update `MARKDOWN_SPEC_COMPLIANCE.md` - Update status

---

## 🚀 Ready to Start?

### Before You Begin:
1. ✅ Read this entire NEXT_STEPS.md
2. ✅ Review current test structure
3. ✅ Read relevant spec section
4. ✅ Check AST types
5. ✅ Plan test cases

### Getting Started with Footnotes:
```bash
# 1. Read spec
cat bluePrint/markdownRenderRules.md | grep -A 30 "Footnotes"

# 2. Check current state
npm test  # See baseline: 94 tests passing

# 3. Review similar code
grep -n "parseInline" src/parser/parser.ts

# 4. Create feature branch
git checkout -b feature/footnotes

# 5. Start coding and testing!
npm test -- --watch
```

---

**Status**: Ready to continue with next extension  
**Next Action**: Start Footnotes implementation  
**Estimated Completion**: 3-4 hours  
**Tests After**: 102-104 total passing (100%)

---

*Last Updated: November 5, 2025*  
*Developer Guide Version: 1.0*  
*Ready for next phase development*
