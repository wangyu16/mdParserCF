# Refactoring Workflow: Element Detection Isolation

## Branch Strategy

**Feature Branch**: `refactor/element-detection-isolation`
**Base Branch**: `main`
**Merge Strategy**: Squash merge after all phases complete and tested

---

## Development Workflow

### Phase Progression

Each phase follows this workflow:

```bash
# 1. Implement phase
# 2. Run tests
npm test

# 3. If tests pass, commit
git add .
git commit -m "Phase X: [Description] - Y tests passing"

# 4. If tests fail, debug or rollback
git reset --hard HEAD~1  # Rollback if needed

# 5. Continue to next phase
```

### Commit Convention

```
Phase 1: Add pre-processing layer - 242 tests passing
Phase 2: Integrate pre-processing - 242 tests passing
Phase 3: Add parent context tracking - 242 tests passing
Phase 4: Add list depth tracking - 250+ tests passing
Final: Refactoring complete - Bug 1 and Bug 4 fixed
```

---

## Testing Strategy

### After Each Phase

```bash
# Run full test suite
npm test

# Build and verify
npm run build

# Visual check - regenerate HTML
node convert-md-to-html.js examples/features.md

# Browser test (if needed)
"$BROWSER" output.html
```

### Critical Test Cases

1. **Bug 4**: `**\*Escaped\***` must render correctly
2. **Bug 1**: Section 22 nested lists must preserve all formatting
3. **Existing 242 tests**: Must all continue passing
4. **Simple cases**: Bold, italic, code spans must work unchanged

---

## Phase Implementation Status

### Phase 1: Pre-Processing Layer

- [ ] Create `PreprocessedText` and `ProtectedRegion` interfaces
- [ ] Write TDD tests for `preprocessInlineText()`
- [ ] Implement `preprocessInlineText()` method
- [ ] Verify preprocessing tests pass
- [ ] Run full test suite (242 must pass)
- [ ] **Git commit**: `Phase 1: Add pre-processing layer - 242 tests passing`

### Phase 2: Integration

- [ ] Modify `parseInline()` to call pre-processing
- [ ] Add placeholder restoration logic
- [ ] Remove old escaped character handling (lines 1150-1157)
- [ ] Write integration tests
- [ ] Test Bug 4 example manually
- [ ] Run full test suite (242 must pass)
- [ ] **Git commit**: `Phase 2: Integrate pre-processing - 242 tests passing`

### Phase 3: Parent Context Tracking

- [ ] Add `parentContext` optional parameter
- [ ] Update all 19 recursive `parseInline()` calls
- [ ] Add context-aware skip logic
- [ ] Write parent-child tests
- [ ] Run full test suite (242 must pass)
- [ ] **Git commit**: `Phase 3: Add parent context tracking - 242 tests passing`

### Phase 4: List Depth Tracking

- [ ] Add `depth` parameter to list methods
- [ ] Add metadata to list AST nodes
- [ ] Modify renderer to use depth
- [ ] Test simple lists (unchanged behavior)
- [ ] Test Section 22 complex nesting
- [ ] Run full test suite (250+ should pass with new tests)
- [ ] **Git commit**: `Phase 4: Add list depth tracking - 250+ tests passing`

### Final Validation

- [ ] Regenerate all example HTML files
- [ ] Visual browser testing
- [ ] Update `examples/bugs.md` (Bug 1 and Bug 4 → SOLVED)
- [ ] Update test count in README
- [ ] Create `REFACTORING_COMPLETE.md`
- [ ] **Git commit**: `Final: Refactoring complete - Bug 1 and Bug 4 fixed`

---

## Merge Back to Main

### Pre-Merge Checklist

- [ ] All 4 phases complete
- [ ] All tests passing (250+ expected)
- [ ] Bug 4 verified fixed: `**\*Escaped\***` renders correctly
- [ ] Bug 1 verified fixed: Section 22 renders with all formatting
- [ ] No performance degradation
- [ ] Documentation updated
- [ ] Code reviewed

### Merge Commands

```bash
# Switch back to main
git checkout main

# Merge feature branch (squash all phase commits into one)
git merge --squash refactor/element-detection-isolation

# Create final commit
git commit -m "Refactor: Isolate element detection for proper parent-child rendering

- Fixed Bug 4: Escaped characters in complex formatting
- Fixed Bug 1: Nested lists with multiple formatting elements
- Added pre-processing layer for protected regions
- Added parent context tracking to parseInline()
- Added depth tracking for nested lists
- All 250+ tests passing
- Zero breaking changes to existing API"

# Push to remote
git push origin main

# Delete feature branch (optional)
git branch -d refactor/element-detection-isolation
```

---

## Rollback Plan

### During Development

If any phase fails:

```bash
# Rollback to previous commit
git reset --hard HEAD~1

# Or rollback to specific phase
git log --oneline  # Find commit hash
git reset --hard <commit-hash>
```

### After Merge (Emergency)

If major issues discovered after merge:

```bash
# Revert the merge commit
git revert <merge-commit-hash>

# Or hard reset (if not pushed to remote yet)
git reset --hard HEAD~1
```

### Feature Flag Fallback

Keep in code temporarily:

```typescript
interface ParserOptions {
  useRefactoredParser?: boolean; // Default: true
}

// In parseInline():
if (!this.options.useRefactoredParser) {
  return this.parseInlineLegacy(text);
}
```

---

## Current Branch Status

**Branch**: `refactor/element-detection-isolation`
**Base Commit**: `2a0aacc bugs fixed`
**Status**: Ready for Phase 1 implementation

---

## Next Actions

1. **Start Phase 1**: Implement pre-processing layer with TDD
2. **Test thoroughly**: All 242 tests must continue passing
3. **Commit**: Create checkpoint after Phase 1 success
4. **Continue**: Move to Phase 2 only after Phase 1 complete

---

## Notes

- Git LFS warning can be ignored (no large binary files in this refactoring)
- Each phase is designed to be independently testable
- Working tree is clean at branch creation
- All changes isolated to feature branch until final merge
- Main branch remains stable throughout development

**Ready to begin Phase 1!** 🚀
