# Project Organization & Documentation Structure

This document explains how the project is organized and where to find what you need.

---

## 📂 Folder Organization

### Root Level Files
```
NEXT_STEPS.md              ← START HERE: What to do next
README.md                  ← Project overview & quick reference
ORGANIZATION.md            ← This file: Project structure
.PROJECT_COMPLETE          ← Project completion summary
```

### Source Code (`src/`)
```
src/parser/
  ├── ast-types.ts         # All AST node type definitions
  ├── parser.ts            # Main parser logic
  └── precedence.ts        # Parsing rules and utilities

src/renderer/
  ├── html-renderer.ts     # HTML generation from AST
  └── escaper.ts           # Security & HTML escaping

src/index.ts               # Public API entry point
```

### Tests (`tests/unit/`)
```
tests/unit/
  ├── parser.test.ts       # 35 parser tests
  └── renderer.test.ts     # 33 renderer tests
```

### Documentation - CONSTRUCTION NOTES (`constructionNotes/`)
**👉 All development documentation is here**

```
constructionNotes/
├── README.md                  # Guide to this folder
├── PHASE1_COMPLETION.md       # Phase 1 status & achievements
├── PHASE1_EXTENSIONS.md       # How to add new features
├── PROJECT_STATUS.md          # Complete project dashboard
├── SESSION_SUMMARY.md         # Latest session work
├── CELEBRATION.md             # Achievements summary
├── CHECKLIST.md               # Development tasks
├── FILES_CREATED.md           # File inventory
└── SETUP_GUIDE.md             # Environment setup
```

### Specifications (`bluePrint/`)
```
bluePrint/
├── projectBlueprint.md        # Complete project plan & architecture
├── markdownRenderRules.md     # Official markdown specification
└── testMarkdownSyntax.md      # Test cases & examples
```

### Configuration Files
```
package.json                   # Dependencies & scripts
tsconfig.json                  # TypeScript configuration
vitest.config.ts              # Test configuration
vite.config.ts                # Build configuration
wrangler.toml                 # Cloudflare Workers config
eslint.config.js              # Linting configuration
prettier.config.js            # Code formatting configuration
```

---

## 🗺️ Quick Navigation by Task

### I want to...

**...understand the project**
→ Read: `README.md` + `NEXT_STEPS.md`

**...know what's done**
→ Check: `constructionNotes/PROJECT_STATUS.md`

**...add a new markdown feature**
→ Follow: `constructionNotes/PHASE1_EXTENSIONS.md`

**...set up development environment**
→ See: `constructionNotes/SETUP_GUIDE.md`

**...understand architecture**
→ Read: `bluePrint/projectBlueprint.md`

**...see what tests exist**
→ Look at: `tests/unit/parser.test.ts` and `tests/unit/renderer.test.ts`

**...debug a problem**
→ Check: `constructionNotes/PHASE1_COMPLETION.md` (Known Issues section)

**...find all session notes**
→ Go to: `constructionNotes/README.md`

---

## 📊 Documentation Map

```
┌─ PROJECT OVERVIEW
│  ├─ README.md (main entry point)
│  ├─ NEXT_STEPS.md (what to do)
│  └─ .PROJECT_COMPLETE (status)
│
├─ SPECIFICATIONS
│  ├─ bluePrint/projectBlueprint.md (architecture)
│  ├─ bluePrint/markdownRenderRules.md (features)
│  └─ bluePrint/testMarkdownSyntax.md (examples)
│
├─ CONSTRUCTION NOTES (development docs)
│  ├─ constructionNotes/README.md (guide to this folder)
│  ├─ constructionNotes/PHASE1_EXTENSIONS.md ← START HERE to add features
│  ├─ constructionNotes/PROJECT_STATUS.md (metrics)
│  ├─ constructionNotes/PHASE1_COMPLETION.md (status)
│  └─ ... (other session docs)
│
└─ SOURCE CODE
   ├─ src/ (implementation)
   └─ tests/ (68 tests, all passing)
```

---

## 📝 File Purposes at a Glance

| File | Purpose | Audience |
|------|---------|----------|
| README.md | Project overview | Everyone |
| NEXT_STEPS.md | What to work on next | Developers |
| ORGANIZATION.md | This file | Developers looking for docs |
| .PROJECT_COMPLETE | Status summary | Quick reference |
| constructionNotes/ | All development docs | Active developers |
| constructionNotes/PHASE1_EXTENSIONS.md | How to add features | Feature implementers |
| bluePrint/projectBlueprint.md | Full architecture | Architects/leads |
| src/ | Working code | Developers |
| tests/ | Test suite | QA/developers |

---

## 🚀 Workflow

### Starting a Development Session
1. Read `NEXT_STEPS.md` to understand current state
2. Pick a task from the list
3. Open `constructionNotes/PHASE1_EXTENSIONS.md` for the guide
4. Code following the TDD approach
5. Run `npm test` to validate
6. Commit changes to git

### Tracking Progress
1. Update `constructionNotes/CHECKLIST.md` as you work
2. Keep notes in `constructionNotes/SESSION_SUMMARY.md`
3. After major features: update `constructionNotes/PROJECT_STATUS.md`

### Looking Something Up
1. If about project state → Check `constructionNotes/`
2. If about architecture → Read `bluePrint/projectBlueprint.md`
3. If about code → Look in `src/` files with comments
4. If about testing → Check `tests/unit/`
5. If about how-to → Check `constructionNotes/PHASE1_EXTENSIONS.md`

---

## 📚 Reading Order for New Developers

**First Time Setup**
1. `README.md` - Understand what the project is
2. `NEXT_STEPS.md` - See what's needed
3. `constructionNotes/SETUP_GUIDE.md` - Set up environment
4. `npm test` - Run tests to verify setup

**Before Implementing Features**
1. `bluePrint/projectBlueprint.md` - Understand architecture
2. `bluePrint/markdownRenderRules.md` - See markdown spec
3. `constructionNotes/PHASE1_EXTENSIONS.md` - Learn the pattern
4. `src/parser/ast-types.ts` - Understand AST structure
5. Existing test in `tests/unit/` - See testing pattern

**Before Debugging**
1. `constructionNotes/PHASE1_COMPLETION.md` - Known issues
2. `src/` with comments - Code explanation
3. `tests/unit/` - See how it should work
4. `constructionNotes/PROJECT_STATUS.md` - Debug tips section

---

## ✨ Key Files to Know

### Most Important
- **NEXT_STEPS.md** - Start here for what to do next
- **constructionNotes/PHASE1_EXTENSIONS.md** - Step-by-step feature guide
- **src/parser/parser.ts** - Where parsing happens
- **src/renderer/html-renderer.ts** - Where rendering happens
- **tests/unit/parser.test.ts** - Test patterns for parser

### Reference
- **bluePrint/projectBlueprint.md** - Full architecture reference
- **src/parser/ast-types.ts** - AST node definitions
- **constructionNotes/PROJECT_STATUS.md** - Project metrics

### Status Tracking
- **constructionNotes/CHECKLIST.md** - Current tasks
- **constructionNotes/PROJECT_STATUS.md** - Project metrics
- **.PROJECT_COMPLETE** - Current phase status

---

## 🎯 Common Scenarios

### Scenario: I want to add table support
1. Open `constructionNotes/PHASE1_EXTENSIONS.md`
2. Search for "Adding a New Block Element" section
3. Follow the 6-step process
4. Use Table implementation as first example

### Scenario: Tests are failing
1. Check `constructionNotes/PHASE1_COMPLETION.md` Bug Fixes section
2. Look at similar working tests in `tests/unit/`
3. Add debug logging and rerun `npm test`
4. Check `src/` file comments for explanation

### Scenario: I don't know where a function is
1. Check `constructionNotes/PROJECT_STATUS.md` Code Organization
2. Look in `src/` for the logical location
3. Use grep to search: `grep -r "functionName" src/`
4. Check test files for usage examples

### Scenario: Want to understand the full project
1. Read `README.md` - 5 minutes
2. Skim `bluePrint/projectBlueprint.md` - 15 minutes
3. Check `constructionNotes/PROJECT_STATUS.md` - 10 minutes
4. Total: 30 minutes to understand everything

---

## 💡 Pro Tips

1. **Always start with tests** - Look at existing tests to understand patterns
2. **constructionNotes folder is your friend** - All development knowledge is there
3. **PHASE1_EXTENSIONS.md is your guide** - Follow it exactly for new features
4. **Run tests after every change** - `npm test` takes <1 second
5. **Check comments in code** - Most complex logic is explained

---

## 📞 Getting Help

**Can't find something?**
→ Search this file (ORGANIZATION.md) for the task

**Don't know how to implement feature?**
→ Read `constructionNotes/PHASE1_EXTENSIONS.md`

**Tests failing?**
→ Check `constructionNotes/PHASE1_COMPLETION.md` Bug Fixes

**Need project overview?**
→ Read `README.md` then `NEXT_STEPS.md`

**Want to understand code?**
→ Look at similar working tests in `tests/unit/`

---

## ✅ Documentation Checklist

- [x] README.md - Project overview
- [x] NEXT_STEPS.md - What to do next
- [x] ORGANIZATION.md - This file
- [x] constructionNotes/ - All development docs
- [x] bluePrint/ - Project specifications
- [x] src/ - Well-commented source code
- [x] tests/ - Comprehensive test suite
- [x] Code comments - In important functions

---

**Last Updated:** Phase 1 Core Complete  
**Status:** Ready for Phase 1 Extensions  
**All Documentation:** Organized and accessible

---

For the latest info, always check `NEXT_STEPS.md` first!
