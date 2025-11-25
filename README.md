# mdParserCF

A comprehensive, customizable Markdown parser designed for deployment on Cloudflare Workers with full local development support.

Read 'examples/features.md' to see all the features.

To test, use 'convert-md-to-html.js', local parser by default, '-api' cloud parser.

## 📦 Installation

```bash
npm install mdparser-cf
```

Or with other package managers:

```bash
yarn add mdparser-cf
pnpm add mdparser-cf
```

## 🚀 Quick Usage

### Basic Example

```typescript
import { Parser, HTMLRenderer } from 'mdparser-cf';

// Parse markdown to HTML
const parser = new Parser();
const ast = parser.parse('# Hello World\n\nThis is **bold**.');

const renderer = new HTMLRenderer();
const { html } = renderer.render(ast);
console.log(html);
// Output: <h1>Hello World</h1>\n<p>This is <strong>bold</strong>.</p>
```

### Simple One-Liner

```typescript
import { mdToHtml } from 'mdparser-cf';

const html = await mdToHtml('# Hello\n\nThis is $E=mc^2$');
```

### With Math Formulas

```typescript
import { Parser, HTMLRenderer } from 'mdparser-cf';

const markdown = `
# Math Example

Inline math: $E = mc^2$

Block math:
$$
\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}
$$
`;

const parser = new Parser({ enableMath: true });
const ast = parser.parse(markdown);

const renderer = new HTMLRenderer();
const { html } = renderer.render(ast);
```

### Advanced: Direct Parser/Renderer Access

```typescript
import { Parser, HTMLRenderer, type Document } from 'mdparser-cf';

// Configure parser
const parser = new Parser({
  enableMath: true,
  enablePlugins: true,
  debugAST: false,
});

// Parse to AST
const ast: Document = parser.parse(markdown);

// Render to HTML
const renderer = new HTMLRenderer();
const output = renderer.render(ast);

console.log(output.html); // HTML string
console.log(output.headings); // Extracted headings for TOC
```

## ✨ Features

- **Complete Markdown Support** - All standard markdown elements plus custom extensions
- **Cloudflare Workers Ready** - Optimized for serverless deployment
- **Local Development** - Works perfectly for local development and testing
- **Extensible Plugin System** - Easy to add custom content processors
- **Math & Chemistry** - Built-in support for KaTeX and mhchem formulas
- **Syntax Highlighting** - Code block highlighting integration
- **Type-Safe** - 100% TypeScript with strict type checking
- **Well-Tested** - Comprehensive test coverage with Vitest
- **Developer Friendly** - Devcontainer setup for instant development environment

## 📚 Documentation

- **[Project Blueprint](bluePrint/projectBlueprint.md)** - Complete development plan and architecture
- **[Markdown Rendering Rules](bluePrint/markdownRenderRules.md)** - Full specification of supported markdown
- **[Test Syntax](bluePrint/testMarkdownSyntax.md)** - Test cases and syntax examples

## 🚀 Quick Start

### Using GitHub Codespaces (Recommended)

1. Open repository in Codespaces
2. Development environment automatically sets up via devcontainer
3. Ready to code in seconds!

### Local Development

```bash
# Prerequisites: Node.js 22+, npm, Docker (for devcontainer)

# Clone and setup
git clone <repo-url>
cd mdParserCF
npm install

# Run tests
npm test

# Start dev server
npm run dev
```

## 🛠️ Development Setup

### Devcontainer

The `.devcontainer/devcontainer.json` provides a complete development environment with:

- Node.js 22
- Wrangler CLI for Cloudflare Workers
- Docker support
- Pre-configured VS Code extensions
- Debugging capabilities

### Local Setup

See [Project Blueprint - Development Environment](bluePrint/projectBlueprint.md#-development-environment-setup) for detailed local setup instructions.

## 📝 NPM Scripts

```bash
# Development
npm run dev              # Start local dev server
npm run dev:wrangler    # Start Cloudflare Wrangler dev

# Building
npm run build           # Build for production
npm run type-check      # TypeScript type checking

# Testing
npm test                # Run all tests
npm test -- --watch     # Watch mode
npm test -- --ui        # Test UI explorer
npm run test:coverage   # Coverage report

# Code Quality
npm run lint            # Check code quality
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier

# Deployment
npm run deploy          # Deploy to production
npm run deploy:staging  # Deploy to staging
```

## 🏗️ Project Structure

```
mdParserCF/
├── src/                    # Source code
│   ├── parser/            # Tokenizer & parser
│   ├── renderer/          # HTML generation
│   ├── plugins/           # Custom plugins
│   ├── extensions/        # Markdown extensions
│   ├── utils/             # Utilities
│   └── cloudflare/        # Cloudflare integration
├── tests/                 # Test suites
│   ├── unit/             # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/         # Test data & snapshots
├── bluePrint/            # Project documentation
├── docs/                 # Detailed documentation
├── .devcontainer/        # Devcontainer setup
├── .github/workflows/    # CI/CD pipelines
└── wrangler.toml         # Cloudflare config
```

## 🧪 Testing

The project uses **Vitest** for fast, type-safe testing:

```bash
# Run all tests
npm test

# Watch mode for TDD
npm test -- --watch

# Test UI for exploration
npm test -- --ui

# Coverage report
npm run test:coverage
```

### Test Coverage Goals

- Minimum 80% overall
- 90%+ for parser core
- 85%+ branch coverage

## 🔍 Debugging

### VS Code Debugging

1. Open file with breakpoint
2. Press `F5` to start debugger
3. Use Debug Console for evaluation

**Debug Configurations:**

- Debug Tests
- Debug Application
- Attach to Running Process

### Logging

Use the built-in logger for development:

```typescript
import { logger } from './src/utils/logger';

logger.debug('Debug info'); // Only shown in LOG_LEVEL=debug
logger.info('Information'); // Normal logging
logger.warn('Warning'); // Warning messages
logger.error('Error'); // Error messages
```

Control verbosity:

```bash
LOG_LEVEL=debug npm run dev     # Verbose
LOG_LEVEL=info npm run dev      # Normal
LOG_LEVEL=warn npm run dev      # Only warnings/errors
```

## 🚀 Deployment

### To Cloudflare Workers

```bash
# Setup authentication
wrangler login

# Deploy to production
npm run deploy

# Deploy to staging environment
npm run deploy:staging

# Rollback to previous version
wrangler rollback
```

### Configuration

Edit `wrangler.toml` to configure:

- Worker name and route
- Environment variables
- KV namespaces
- R2 buckets
- etc.

## 📖 Documentation

### Technical Docs (To Be Created)

- Architecture guides in `docs/`
- Plugin development documentation
- Debugging and performance guides

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📋 Supported Markdown

### Core Elements ✅

- Headings (h1-h6)
- Paragraphs with line breaks
- Bold, italic, underline
- Blockquotes (including nested)
- Lists (ordered, unordered, nested)
- Code (inline, fenced, indented)
- Horizontal rules
- Links and images (inline & reference-style)
- HTML passthrough with markdown parsing inside

## 📋 Supported Markdown

### Core Elements ✅

- Headings (h1-h6)
- Paragraphs with line breaks
- Bold, italic, underline, strikethrough
- Blockquotes (including nested)
- Lists (ordered, unordered, nested)
- Code (inline, fenced, indented)
- Horizontal rules
- Links and images (inline, reference-style, auto-link)
- HTML passthrough with markdown parsing inside

### Phase 1 Extensions ✅

- **Tables** (GFM with alignment) - ✅ FULLY IMPLEMENTED
  - Support for `:---` (left), `:-:` (center), `---:` (right) alignment
  - Inline markdown within cells
  - Semantic HTML output
- **Strikethrough** (`~~text~~`) - ✅ FULLY IMPLEMENTED
  - Support for nested formatting
  - Semantic `<del>` tag output
- **Footnotes** (`[^1]`) - ✅ FULLY IMPLEMENTED
  - Multi-paragraph footnote support
- **Custom Containers** (`:::class...:::`) - ✅ FULLY IMPLEMENTED
  - Block and inline containers
- **Inline Styles** - ✅ FULLY IMPLEMENTED
  - Superscript (`^text^`), subscript (`~text~`)
  - Highlight (`==text==`), underline (`++text++`)
- **Line Breaks** - ✅ FULLY IMPLEMENTED
  - Hard breaks (two spaces + newline)
  - Soft breaks (automatic)
- **Extended Links** - ✅ FULLY IMPLEMENTED
  - Reference-style links
  - Auto-links (bare URLs, emails)
- **Image Attributes** - ✅ FULLY IMPLEMENTED
  - Size, alignment, CSS classes

### Advanced Features ✅

- **Math Formulas** - ✅ FULLY IMPLEMENTED
  - Inline: `$E=mc^2$`
  - Block: `$$formula$$`
  - KaTeX with mhchem chemistry support
  - Server-side rendering
- **Custom Plugins** - ✅ FULLY IMPLEMENTED
  - 6 built-in plugins (YouTube, Emoji, SMILES, QR Code, Badge, Mermaid)
  - SMILES chemical structures with SmilesDrawer
  - QR Code generation with cloud API (async)
  - Async plugin system with post-processing
  - Extensible plugin system for custom additions

### Planned Features 📅 (Phase 2)

- 3D Molecular Structure Viewer (3Dmol.js/NGL)
- Reaction Mechanism Visualization (SVG arrows)
- Spectroscopic Data Viewer (NMR/IR/MS)
- Data Plotting (Plotly/Vega-Lite)
- And 6 more chemistry/science plugins

## 🐛 Known Issues

None currently. See GitHub Issues for tracking.

## 📜 License

[To be added]

## 🔗 Resources

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Vitest Docs](https://vitest.dev/)
- [CommonMark Spec](https://spec.commonmark.org/)

---

## 📊 Project Status

**Phase 1 Status**: ✅ **COMPLETE**

- **269/276 tests passing (97.5%)**
- All markdown features implemented
- 6 plugins verified working (including chemical reactions)
- Math formulas with chemistry support
- Enhanced list parsing (depth tracking, block elements in lists)
- Production-ready code

**Recent Improvements**:

- ✅ Fixed complex list nesting (multiple paragraphs, code blocks, blockquotes)
- ✅ Added list depth CSS classes (depth-0, depth-1, depth-2, depth-3)
- ✅ Improved escaped character handling
- ✅ Fixed blockquote multiline rendering

**Known Limitations** (7 edge cases, <3% of tests):

- Complex nested emphasis with escaped delimiters
- Math formulas in some emphasis contexts
- Plugin syntax in some emphasis contexts

**Next Steps**: See [Next Steps Roadmap](NEXT_STEPS.md) for Phase 2 options

**Priority**: Cloudflare Workers deployment (2-3 hours) → Enables production use

---

**Status**: ✅ Phase 1 Complete | 🔄 Ready for Phase 2  
**Version**: 1.0  
**Last Updated**: November 5, 2025
