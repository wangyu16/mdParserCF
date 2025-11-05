# mdParserCF - Markdown Parser for Cloudflare Workers
## Project Development Blueprint & Architecture Plan

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Architecture](#project-architecture)
4. [File Structure](#file-structure)
5. [Technology Stack](#technology-stack)
6. [Development Workflow](#development-workflow)
7. [Testing Strategy](#testing-strategy)
8. [Debugging & Maintenance](#debugging--maintenance)
9. [Deployment Strategy](#deployment-strategy)
10. [Configuration Files](#configuration-files)
11. [Phase Implementation Plan](#phase-implementation-plan)

---

## 📌 Project Overview

**mdParserCF** is a customized Markdown parser designed to be deployed on Cloudflare Workers with support for local development. The parser implements a comprehensive set of Markdown rendering rules with custom extensions including:

- Standard Markdown (headings, lists, emphasis, blockquotes, etc.)
- Code blocks with syntax highlighting support
- Tables with column alignment
- Links and images with reference-style support
- Footnotes with multi-paragraph support
- Custom containers (inline span and block div)
- Math formulas (KaTeX + mhchem)
- Custom plugins (YouTube, SMILES, markdown import, etc.)
- Proper parsing precedence and HTML escaping

### Key Requirements
- ✅ Deployable to Cloudflare Workers
- ✅ Works locally for development and testing
- ✅ Comprehensive test coverage
- ✅ Easy debugging and maintenance
- ✅ Support for all rendering rules defined in `markdownRenderRules.md`
- ✅ Extensible plugin architecture

---

## 🚀 Development Environment Setup

### Prerequisites
- GitHub Codespaces or local Docker installation
- Git
- Node.js 22+ (provided by devcontainer)

### Automatic Setup with Devcontainer

The `.devcontainer/devcontainer.json` provides a complete development environment with:

**Base Image:** Node.js 22 (Bookworm)

**Key Features:**
- Integrated Docker support (Docker-in-Docker)
- Git and GitHub CLI pre-configured
- SSH and Git config mounts for authentication
- Three forwarded ports:
  - `8787` - Cloudflare Wrangler dev server
  - `3000` - Local development server
  - `5173` - Vite preview server

**Pre-installed VS Code Extensions:**
- ESLint & Prettier (code quality & formatting)
- Makefile Tools (build automation)
- GitLens (Git integration)
- Vitest Explorer (test runner)
- TypeScript Next (latest TS support)
- GitHub Copilot & PR integration

**Environment Variables:**
```bash
NODE_ENV=development      # Development mode
LOG_LEVEL=debug           # Verbose logging for debugging
```

### Manual Local Setup (Non-Codespaces)

```bash
# Clone repository
git clone <repo-url>
cd mdParserCF

# Install Node.js 22+ and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22

# Install global tools
npm install -g npm@latest pnpm wrangler

# Install dependencies
npm install

# Create project directories
mkdir -p src/{parser,plugins,utils} tests/{unit,integration} docs dist

# Set up Git hooks (optional)
npx husky install
```

---

## 🏗️ Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Input: Markdown Text                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│            Tokenizer / Lexical Analysis                  │
│    - Identify block-level elements                       │
│    - Extract inline elements                             │
│    - Handle escaping and HTML                            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│            Parser / Syntax Analysis                      │
│    - Build AST (Abstract Syntax Tree)                    │
│    - Respect parsing precedence rules                    │
│    - Handle nested structures                            │
│    - Apply custom extensions                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│        Transformation / Plugin Processing                │
│    - Execute plugin handlers                             │
│    - Resolve custom containers                          │
│    - Process math formulas                               │
│    - Handle footnote collection & rendering              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│        Renderer / HTML Generation                        │
│    - Convert AST to HTML                                 │
│    - Apply syntax highlighting (for code blocks)         │
│    - Integrate external scripts (KaTeX, etc.)            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Output: HTML                            │
└─────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|-----------------|
| **Tokenizer** | Break markdown into logical tokens (blocks/inlines) |
| **Parser** | Build AST respecting parsing precedence |
| **AST** | Intermediate representation of document structure |
| **Plugins** | Extend functionality (YouTube, SMILES, etc.) |
| **Renderer** | Convert AST to HTML with proper escaping |
| **Utilities** | Shared functions (escaping, normalization, etc.) |

---

## 📂 File Structure

```
mdParserCF/
├── .devcontainer/
│   ├── devcontainer.json          # Devcontainer configuration
│   └── setup.sh                    # Automated environment setup
│
├── src/
│   ├── index.ts                    # Main entry point (exports Parser class)
│   ├── parser/
│   │   ├── tokenizer.ts           # Lexical analysis
│   │   ├── parser.ts              # Syntax analysis & AST building
│   │   ├── ast-types.ts           # AST node type definitions
│   │   └── precedence.ts          # Parsing order & precedence rules
│   │
│   ├── renderer/
│   │   ├── html-renderer.ts       # HTML generation from AST
│   │   └── escaper.ts             # HTML escaping utilities
│   │
│   ├── plugins/
│   │   ├── plugin-registry.ts     # Plugin management system
│   │   ├── built-in/
│   │   │   ├── youtube.ts         # YouTube embed plugin
│   │   │   ├── smiles.ts          # SMILES chemical structure plugin
│   │   │   └── markdown-import.ts # External markdown importer plugin
│   │   └── examples/
│   │       └── custom-plugin.example.ts  # Template for custom plugins
│   │
│   ├── extensions/
│   │   ├── custom-containers.ts   # ::classname[content]:: syntax
│   │   ├── math-renderer.ts       # $math$ and $$math$$ processing
│   │   ├── footnotes.ts           # Footnote collection & rendering
│   │   └── code-highlighter.ts    # Syntax highlighting for code blocks
│   │
│   ├── utils/
│   │   ├── string-utils.ts        # String manipulation helpers
│   │   ├── html-utils.ts          # HTML-related utilities
│   │   ├── logger.ts              # Logging utility (debug/info/error)
│   │   └── cache.ts               # Memoization for expensive operations
│   │
│   └── cloudflare/
│       ├── worker.ts              # Cloudflare Worker entry point
│       └── wrangler-config.ts     # Wrangler configuration helpers
│
├── tests/
│   ├── unit/
│   │   ├── tokenizer.test.ts      # Tokenizer unit tests
│   │   ├── parser.test.ts         # Parser unit tests
│   │   ├── renderer.test.ts       # Renderer unit tests
│   │   ├── plugins.test.ts        # Plugin system tests
│   │   └── utils.test.ts          # Utility function tests
│   │
│   ├── integration/
│   │   ├── full-markdown.test.ts  # End-to-end markdown rendering
│   │   ├── cloudflare.test.ts     # Cloudflare Worker integration
│   │   └── plugin-integration.test.ts  # Plugin system integration
│   │
│   └── fixtures/
│       ├── markdown/              # Sample markdown files
│       │   ├── all-features.md
│       │   ├── edge-cases.md
│       │   └── performance.md
│       └── snapshots/             # Expected outputs for snapshot tests
│
├── docs/
│   ├── architecture.md            # Detailed architecture documentation
│   ├── parser-guide.md            # How the parser works
│   ├── plugin-development.md      # Guide for creating custom plugins
│   ├── debugging.md               # Debugging tips & techniques
│   └── performance.md             # Performance optimization guide
│
├── bluePrint/
│   ├── projectBlueprint.md        # This file - overall project plan
│   ├── markdownRenderRules.md     # Official markdown rendering spec
│   └── testMarkdownSyntax.md      # Test cases & syntax examples
│
├── wrangler.toml                  # Cloudflare Worker configuration
├── package.json                   # Project dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.js               # ESLint rules
├── prettier.config.js             # Code formatting rules
├── vitest.config.ts               # Vitest test configuration
├── .github/
│   └── workflows/
│       ├── test.yml               # Automated testing on push/PR
│       ├── lint.yml               # Code quality checks
│       └── deploy.yml             # Automated deployment to Cloudflare
│
├── .gitignore                     # Git ignore rules
├── README.md                      # Project README
└── CONTRIBUTING.md                # Contribution guidelines
```

---

## 🛠️ Technology Stack

### Core Dependencies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 22+ | Runtime environment |
| **TypeScript** | 5.0+ | Type-safe development |
| **Cloudflare Workers** | Latest | Deployment target |
| **Wrangler** | Latest | CF Workers CLI |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Vitest** | Fast unit testing framework |
| **ESLint** | Code linting & quality |
| **Prettier** | Code formatting |
| **TypeScript Compiler** | Type checking & compilation |
| **Husky** | Git hooks automation (pre-commit linting) |

### Optional Enhancements
| Library | Purpose | Status |
|---------|---------|--------|
| **KaTeX** | Math rendering (math blocks) | Optional CDN |
| **Highlight.js** | Syntax highlighting | Optional CDN |
| **SmilesDrawer** | Chemical structure rendering | Optional CDN |

**Note:** External libraries like KaTeX, Highlight.js, and SmilesDrawer are served via CDN in rendered HTML, not included in the parser bundle.

---

## 💻 Development Workflow

### Initial Project Setup

```bash
# 1. Open in Codespaces or local dev container
# The devcontainer automatically runs setup.sh

# 2. Or manually initialize for existing project
npm init -y
npm install --save-dev \
  typescript @types/node \
  vitest @vitest/ui \
  eslint prettier \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  husky lint-staged

npm install cloudflare:workers wrangler
```

### Daily Development Tasks

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/parser.test.ts

# Watch mode (re-run on file changes)
npm test -- --watch

# UI mode for test exploration
npm test -- --ui
```

#### Local Development Server
```bash
# Start local dev server with hot reload
npm run dev

# Start Cloudflare Wrangler dev server
npm run dev:wrangler

# Build for production
npm run build
```

#### Code Quality Checks
```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check
```

#### Git Workflow
```bash
# Husky will automatically:
# - Run pre-commit linting hooks
# - Block commits with linting errors
# - Run tests before push (if configured)

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit (hooks run automatically)
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature
```

---

## 🧪 Testing Strategy

### Testing Philosophy
- **Unit Tests:** Test individual functions and classes in isolation
- **Integration Tests:** Test how components work together
- **Snapshot Tests:** Verify markdown rendering output (HTML)
- **Regression Tests:** Prevent previously fixed bugs from reoccurring
- **Performance Tests:** Ensure rendering stays under performance budgets

### Test Organization

#### Unit Tests (`tests/unit/`)
Test individual components with mocked dependencies:

```typescript
// Example: tokenizer.test.ts
describe('Tokenizer', () => {
  describe('parseHeadings', () => {
    it('should parse h1-h6 headings', () => {
      expect(tokenizer.parseHeadings('# Heading')).toEqual([...])
    })
    
    it('should require space after hash', () => {
      expect(tokenizer.parseHeadings('#NoSpace')).toEqual([...])
    })
  })
})
```

#### Integration Tests (`tests/integration/`)
Test complete markdown rendering workflows:

```typescript
// Example: full-markdown.test.ts
describe('Full Markdown Rendering', () => {
  it('should parse complex document with multiple elements', () => {
    const markdown = readFixture('all-features.md')
    const result = parser.parse(markdown)
    expect(result).toMatchSnapshot()
  })
})
```

#### Snapshot Tests
Use Vitest snapshot testing for regression detection:

```bash
# Update snapshots after intentional changes
npm test -- --update
```

### Test Coverage Goals
- **Minimum:** 80% overall coverage
- **Target:** 90%+ coverage for parser core
- **Branch coverage:** 85%+ for all decision points

### Running Tests in CI/CD
GitHub Actions workflows automatically run tests on:
- Push to main branch
- Pull requests
- Scheduled daily runs

---

## 🔍 Debugging & Maintenance

### Debugging Strategy

#### 1. **Verbose Logging**
The project includes a `logger` utility with debug levels:

```typescript
// In code:
logger.debug('Parsing block:', block)
logger.info('Found 5 tokens')
logger.warn('Unterminated blockquote')
logger.error('Parsing failed:', error)

// Control via environment variable:
LOG_LEVEL=debug npm run dev        # Show all logs
LOG_LEVEL=warn npm run dev         # Show warnings + errors only
```

#### 2. **AST Inspection**
Enable AST output for debugging:

```typescript
const parser = new Parser({ debugAST: true })
const ast = parser.parse(markdown)
console.log(JSON.stringify(ast, null, 2))  // Pretty-printed AST
```

#### 3. **Breakpoint Debugging**
VS Code debugging is pre-configured:

```bash
# Launch debugger from VS Code
# Press F5 or use Debug menu

# Or run tests in debug mode
npm test -- --inspect
```

**VSCode Debug Configuration (.vscode/launch.json):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--inspect"],
      "console": "integratedTerminal"
    }
  ]
}
```

#### 4. **Test Fixtures for Reproduction**
Add failing test cases to `tests/fixtures/` to reproduce bugs:

```typescript
// tests/unit/parser.test.ts
describe('Bug #123: Nested blockquotes fail', () => {
  it('should handle triple-nested blockquotes', () => {
    const markdown = readFixture('nested-blockquotes-bug.md')
    const result = parser.parse(markdown)
    expect(result).toBeDefined()
    expect(result.includes('<blockquote>')).toBe(true)
  })
})
```

### Maintenance Tasks

#### Weekly
- [ ] Review and merge pull requests
- [ ] Check GitHub Actions for test failures
- [ ] Review performance metrics

#### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Audit security: `npm audit fix`
- [ ] Review code coverage reports
- [ ] Analyze performance trends

#### Quarterly
- [ ] Major version updates: `npm upgrade` (major versions)
- [ ] Review and refactor complex components
- [ ] Update documentation
- [ ] Plan for new features/improvements

### Common Debugging Scenarios

| Issue | Solution |
|-------|----------|
| **Tests fail locally but pass in CI** | Check Node version: `node --version` |
| **Markdown renders incorrectly** | Add test fixture, check parsing precedence |
| **Performance degradation** | Run performance tests, profile with Node inspector |
| **Plugin not working** | Check plugin registry, verify handler function |
| **HTML escaping issues** | Review escaper.ts, add test case |

---

## 🚀 Deployment Strategy

### Deployment Targets

#### 1. **Cloudflare Workers** (Production)
```bash
# Authenticate with Cloudflare
wrangler login

# Deploy to production
npm run deploy

# Deploy to staging
npm run deploy:staging

# Rollback to previous version
wrangler rollback
```

Configuration in `wrangler.toml`:
```toml
name = "mdparser-cf"
type = "javascript"
account_id = "your-account-id"
workers_dev = true
route = "mdparser.example.com/*"
zone_id = "your-zone-id"

[env.staging]
route = "mdparser-staging.example.com/*"

[env.production]
route = "mdparser.example.com/*"
```

#### 2. **Local Node.js Server** (Development/Testing)
```bash
npm run dev        # Dev server with hot reload
npm run build      # Build for production
npm start          # Start production server
```

#### 3. **npm Package** (Library Distribution)
```bash
# Publishing to npm registry
npm version patch  # Bump version
npm publish        # Publish to npm
```

### Pre-Deployment Checklist
- [ ] All tests passing (`npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] TypeScript builds successfully (`npm run type-check`)
- [ ] Bundle size acceptable (`npm run analyze`)
- [ ] Performance benchmarks meet targets
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Git tag created with version

### Deployment Pipeline (CI/CD)

GitHub Actions workflows in `.github/workflows/`:

1. **test.yml** - Run tests on push/PR
2. **lint.yml** - Check code quality on push/PR
3. **deploy.yml** - Deploy to Cloudflare on merge to main

---

## ⚙️ Configuration Files

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### ESLint Configuration (`eslint.config.js`)
```javascript
export default [{
  files: ['src/**/*.ts', 'tests/**/*.ts'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json'
    }
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/explicit-function-return-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}]
```

### Prettier Configuration (`prettier.config.js`)
```javascript
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always'
}
```

### Vitest Configuration (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    },
    testMatch: ['tests/**/*.test.ts']
  }
})
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "dev:wrangler": "wrangler dev",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "format": "prettier --write 'src/**/*.ts' 'tests/**/*.ts'",
    "type-check": "tsc --noEmit",
    "deploy": "npm run build && wrangler deploy",
    "deploy:staging": "npm run build && wrangler deploy --env staging",
    "analyze": "vite build --analyze"
  }
}
```

---

## 📈 Phase Implementation Plan

Note: Save all progressive documents such as CHECKLIST.md, PROJECT_STATUS.md, SESSION_SUMMARY.md, PHASE1_COMPLETION.md, in the folder 'constructionNotes'. 

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Set up core parser infrastructure

- [ ] Initialize project structure and dependencies
- [ ] Create AST type definitions
- [ ] Implement tokenizer for basic markdown
  - Headings, paragraphs, basic inline styles
- [ ] Create basic parser with AST building
- [ ] Implement HTML renderer
- [ ] Write 30+ unit tests
- [ ] Set up CI/CD pipeline

**Deliverable:** Parser works for ~50% of markdown spec

### Phase 2: Core Features (Weeks 3-4)
**Goal:** Implement all standard markdown features

- [ ] Extend tokenizer for advanced features
  - Lists (ordered, unordered, nested)
  - Code blocks (fenced, indented, syntax highlighting prep)
  - Blockquotes (including nested)
  - Tables
  - Links and images
- [ ] Update parser for parsing precedence
- [ ] Implement HTML escaping utilities
- [ ] Add 50+ unit tests
- [ ] Create test fixtures for regression testing

**Deliverable:** Parser handles ~85% of markdown spec

### Phase 3: Extensions & Plugins (Weeks 5-6)
**Goal:** Implement custom extensions and plugin system

- [ ] Implement custom containers (inline & block)
- [ ] Implement footnotes system
- [ ] Implement math rendering (KaTeX integration)
- [ ] Create plugin registry system
- [ ] Implement built-in plugins
  - YouTube embed
  - SMILES chemical structures
  - Markdown import
- [ ] Write plugin integration tests
- [ ] Document plugin development API

**Deliverable:** All rendering rules from spec implemented

### Phase 4: Cloudflare Deployment (Week 7)
**Goal:** Deploy to Cloudflare Workers

- [ ] Create Cloudflare Worker handler
- [ ] Optimize for Workers environment (size, performance)
- [ ] Configure wrangler.toml
- [ ] Implement logging for production debugging
- [ ] Set up staging and production environments
- [ ] Performance optimization & profiling
- [ ] Write deployment documentation

**Deliverable:** Parser deployed and accessible via Cloudflare

### Phase 5: Local Development & Documentation (Week 8)
**Goal:** Polish developer experience

- [ ] Create comprehensive documentation
  - Architecture guide
  - Plugin development guide
  - Debugging guide
  - Performance guide
- [ ] Set up local dev server with hot reload
- [ ] Optimize devcontainer experience
- [ ] Create example implementations
- [ ] Write CONTRIBUTING.md guide
- [ ] Performance benchmarking
- [ ] Final testing and bug fixes

**Deliverable:** Production-ready, well-documented project

### Phase 6+: Maintenance & Enhancement
**Goal:** Ongoing support and improvements

- [ ] Monitor performance and errors
- [ ] Respond to bug reports
- [ ] Accept community contributions
- [ ] Plan future enhancements
- [ ] Keep dependencies updated
- [ ] Regular security audits

---

## 🎯 Success Metrics

### Code Quality
- [ ] 90%+ test coverage
- [ ] All ESLint rules pass
- [ ] No TypeScript errors
- [ ] No critical security vulnerabilities

### Performance
- [ ] Parse 1MB markdown < 500ms
- [ ] Worker response time < 100ms
- [ ] Worker bundle size < 1MB
- [ ] Memory usage < 50MB in Workers

### Developer Experience
- [ ] Setup time < 5 minutes (with devcontainer)
- [ ] All tests run in < 10 seconds
- [ ] Documentation clear and complete
- [ ] Easy debugging with logging system

### Reliability
- [ ] 99.9% uptime in production
- [ ] Zero security vulnerabilities in dependencies
- [ ] All edge cases handled
- [ ] Comprehensive error handling

---

## 📚 Additional Resources

### Documentation Files (To Be Created)
- `docs/architecture.md` - Detailed architecture
- `docs/parser-guide.md` - Parser internals
- `docs/plugin-development.md` - Plugin API
- `docs/debugging.md` - Debugging techniques
- `docs/performance.md` - Optimization guide
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history

### External References
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [KaTeX Documentation](https://katex.org/docs/supported.html)
- [CommonMark Specification](https://spec.commonmark.org/)

---

## 📝 Notes for Future Development

### Known Design Decisions
1. **Parser Strategy:** Recursive descent parser with lookahead for better error handling and debugging
2. **AST Approach:** Intermediate AST representation allows multiple renderer implementations
3. **Plugin System:** Registry-based with dependency injection for easy testing
4. **Logging:** Structured logging with levels for production debugging
5. **Performance:** Caching frequently parsed patterns, lazy evaluation where possible

### Potential Improvements
1. **WASM Integration:** Compile performance-critical parts to WebAssembly
2. **Streaming Rendering:** Support incremental rendering for very large documents
3. **Internationalization:** Support for non-Latin characters and RTL languages
4. **Accessibility:** Enhanced a11y features for rendered HTML
5. **Editor Integration:** VS Code extension for live preview

---

**Last Updated:** November 5, 2025  
**Status:** Development Environment Ready  
**Next Step:** Begin Phase 1 - Foundation Development
