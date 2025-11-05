# GitHub Actions Implementation Guide

**Date**: November 5, 2025  
**Task**: Explain how the CI/CD workflows work and how to use them

---

## 📋 What Was Created

Three YAML workflow files in `.github/workflows/`:

```
.github/
└── workflows/
    ├── test.yml      - Run all tests
    ├── lint.yml      - Check code quality  
    └── build.yml     - Verify build
```

These files tell GitHub Actions what to do when code is pushed or PRs are created.

---

## 🔍 Understanding Each Workflow

### test.yml - Testing Automation

**File Location**: `.github/workflows/test.yml`

**What It Does**:
- Runs every time code is pushed to `main`
- Runs for every pull request to `main`
- Executes: `npm test` (runs all 179 tests)
- Uploads coverage data to Codecov (optional)

**Key Settings**:
```yaml
on:
  push:
    branches: [main]      # Triggers on push to main
  pull_request:
    branches: [main]      # Triggers on PR to main

strategy:
  matrix:
    node-version: [22.x]  # Uses Node.js 22.x
```

**Steps Executed**:
1. Check out your code
2. Setup Node.js 22.x
3. Cache npm packages (faster installs)
4. Run `npm ci` (install dependencies)
5. Run `npm test` (run all tests)
6. Upload coverage (if tests pass)

**What Passes/Fails This Check**:
- ✅ Passes: All 179 tests pass
- ❌ Fails: Any test fails or times out

---

### lint.yml - Code Quality

**File Location**: `.github/workflows/lint.yml`

**What It Does**:
- Runs every time code is pushed to `main`
- Runs for every pull request to `main`
- Checks code formatting, linting, and types

**Steps Executed**:
1. Check out your code
2. Setup Node.js 22.x
3. Cache npm packages
4. Run `npm ci` (install dependencies)
5. Run `npm run lint` (ESLint checks)
6. Run `npm run format -- --check` (Prettier formatting)
7. Run `npm run type-check` (TypeScript types)

**What Passes/Fails This Check**:
- ✅ Passes: 
  - ESLint finds no issues
  - Code is properly formatted
  - TypeScript types are valid
- ❌ Fails: Any of the above fails

---

### build.yml - Build Verification

**File Location**: `.github/workflows/build.yml`

**What It Does**:
- Runs every time code is pushed to `main`
- Runs for every pull request to `main`
- Verifies the project builds successfully

**Steps Executed**:
1. Check out your code
2. Setup Node.js 22.x
3. Cache npm packages
4. Run `npm ci` (install dependencies)
5. Run `npm run build` (build with TypeScript + Vite)
6. Verify `dist/` directory was created

**What Passes/Fails This Check**:
- ✅ Passes:
  - TypeScript compiles without errors
  - Vite bundling succeeds
  - `dist/` directory contains output files
- ❌ Fails: Build command exits with error

---

## 🔄 Workflow Triggers

### When Do Workflows Run?

#### Trigger 1: Push to main branch
```bash
$ git commit -m "fix: do something"
$ git push origin main
# ↓ GitHub Actions triggers automatically
# ✅ test.yml runs
# ✅ lint.yml runs
# ✅ build.yml runs
```

#### Trigger 2: Create a pull request
```bash
$ git checkout -b feature/new-feature
$ git commit -m "feat: new feature"
$ git push origin feature/new-feature
$ # Create PR on GitHub
# ↓ GitHub Actions triggers automatically
# ✅ test.yml runs
# ✅ lint.yml runs
# ✅ build.yml runs
```

#### Trigger 3: Update a pull request
```bash
$ # Edit file in your PR
$ git commit -m "fix: address review feedback"
$ git push origin feature/new-feature
# ↓ GitHub Actions triggers automatically again
# ✅ All workflows run again
```

---

## 📊 How to View Results

### On GitHub Web Interface

1. **Go to your repository**: `github.com/wangyu16/mdParserCF`

2. **Click the "Actions" tab**: Shows workflow history

3. **Click on a workflow run**: See details of that run

4. **Expand a job**: See all steps and their output

5. **View logs**: Click on any step to see full output

### On a Pull Request

1. **Create a PR** on GitHub

2. **Scroll down** to "Checks" section

3. **See status**:
   - ✅ test (Node.js 22.x) - All tests passed
   - ✅ lint (Node.js 22.x) - Code quality passed
   - ✅ build (Node.js 22.x) - Build passed

4. **Click "Details"** next to any check to see full output

---

## 🛠️ Local Development (Before Push)

### Run Tests Before Pushing

To avoid CI/CD failures, run locally first:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/parser.test.ts

# Run with coverage
npm test -- --coverage
```

### Check Code Quality Locally

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format -- --check

# Fix formatting
npm run format

# Type check
npm run type-check
```

### Build Locally

```bash
# Build for production
npm run build

# Verify build output
ls -lh dist/
```

### Full Pre-Push Checklist

```bash
# 1. Run tests
npm test

# 2. Check quality
npm run lint
npm run format -- --check
npm run type-check

# 3. Build
npm run build

# 4. If all pass, push
git push origin main
```

---

## ✅ Successful Workflow Example

**When you push code that passes all checks**:

```
Commit: "feat: add auto-links support"
↓
GitHub Actions Triggered
↓
test.yml runs:
  ✅ Checkout
  ✅ Setup Node.js
  ✅ Cache dependencies
  ✅ npm ci
  ✅ npm test (179/179 passing)
  ✅ Upload coverage
↓
lint.yml runs:
  ✅ Checkout
  ✅ Setup Node.js
  ✅ Cache dependencies
  ✅ npm ci
  ✅ npm run lint (no errors)
  ✅ npm run format --check (all good)
  ✅ npm run type-check (no issues)
↓
build.yml runs:
  ✅ Checkout
  ✅ Setup Node.js
  ✅ Cache dependencies
  ✅ npm ci
  ✅ npm run build (success)
  ✅ dist/ exists
↓
✅ ALL CHECKS PASSED
Ready to merge!
```

---

## ❌ Failed Workflow Example

**When a test fails**:

```
Commit: "feat: broken feature"
↓
GitHub Actions Triggered
↓
test.yml runs:
  ✅ Checkout
  ✅ Setup Node.js
  ✅ Cache dependencies
  ✅ npm ci
  ❌ npm test (178/179 passing, 1 failed!)
     └─ Test: "should parse auto-link"
     └─ Error: Expected link but got text
↓
lint.yml runs: (still runs in parallel)
  ✅ All quality checks pass
↓
build.yml runs: (still runs in parallel)
  ✅ Build passes
↓
❌ TEST FAILED - Cannot merge
Message: "1 test failed - fix the issue and push again"
```

**To fix**:
1. Find the failing test
2. Fix the code
3. Verify locally: `npm test`
4. Push again
5. Workflows run again
6. When all pass: ✅ Ready to merge

---

## 🔧 Customizing Workflows

### To Change What Tests Are Run

Edit `.github/workflows/test.yml`:
```yaml
- name: Run tests
  run: npm test        # Change this command
```

### To Add More Checks

Add a new step to `.github/workflows/lint.yml`:
```yaml
- name: Security audit
  run: npm audit
```

### To Run on Different Branches

Edit the `on` section:
```yaml
on:
  push:
    branches: [main, develop]    # Add develop
  pull_request:
    branches: [main, develop]
```

### To Use Different Node Version

Edit the matrix:
```yaml
strategy:
  matrix:
    node-version: [20.x, 22.x]    # Test on multiple versions
```

---

## 📈 Benefits of This Setup

### 1. **Continuous Testing**
- Every change automatically tested
- 179 tests run in ~1 minute
- Catch issues immediately

### 2. **Quality Gates**
- Code quality checked automatically
- Formatting enforced
- Types verified

### 3. **Build Verification**
- Always know if code compiles
- Bundle size tracked
- Artifacts available

### 4. **Confidence**
- Safe to merge (all checks passed)
- Documentation of what passed/failed
- Reproducible on any machine

### 5. **Team Transparency**
- Everyone sees test results
- PRs show check status
- Clear feedback

---

## 📝 Common Issues & Solutions

### Issue: Test Fails in CI but Passes Locally

**Cause**: Different Node.js version or OS

**Solution**:
```bash
# Match CI Node.js version
node --version  # Should show 22.x
```

### Issue: Prettier Formatting Fails

**Cause**: Local formatting doesn't match CI

**Solution**:
```bash
npm run format     # Fix formatting
git add .
git commit -m "style: fix formatting"
git push
```

### Issue: Types Don't Check in CI

**Cause**: TypeScript config mismatch

**Solution**:
```bash
npm run type-check
# Fix type errors reported
```

### Issue: Build Fails in CI

**Cause**: Missing dependencies or compilation error

**Solution**:
```bash
npm ci        # Clean install
npm run build # Build locally
# Fix any errors reported
```

---

## 🚀 Next Steps

### Before Production Deployment

1. ✅ Push a test commit to verify workflows run
2. ✅ Check GitHub Actions tab to confirm all pass
3. ✅ Review workflow logs for any warnings
4. ✅ Adjust workflows if needed

### For Production

1. Create a `deploy.yml` workflow (Phase 2)
2. Add deployment to staging
3. Add deployment to production
4. Set up automatic rollback

---

## 📚 Reference Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js on GitHub Actions](https://github.com/actions/setup-node)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-pull-requests-with-code-review/about-status-checks)

---

**Document Created**: November 5, 2025  
**Purpose**: Guide users through GitHub Actions CI/CD setup and usage  
**Status**: ✅ Complete and ready for reference
