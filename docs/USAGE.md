# Using mdparser-cf in Your Projects

## 📦 Installation Options

### Option 1: Install from npm (when published)

```bash
npm install mdparser-cf
```

### Option 2: Install from GitHub

```bash
npm install github:wangyu16/mdParserCF
```

### Option 3: Install Locally for Development

```bash
# In the mdParserCF directory
npm link

# In your project directory
npm link mdparser-cf
```

## 🚀 Usage Examples

### 1. Basic Usage - Simple HTML Conversion

```typescript
import { Parser, HTMLRenderer } from 'mdparser-cf';

const parser = new Parser();
const ast = parser.parse('# Hello World\n\nThis is **bold** text.');

const renderer = new HTMLRenderer();
const { html } = renderer.render(ast);

console.log(html);
// <h1>Hello World</h1>
// <p>This is <strong>bold</strong> text.</p>
```

### 2. One-Liner Helper Function

```typescript
import { mdToHtml } from 'mdparser-cf';

const html = await mdToHtml('# Title\n\nParagraph with *emphasis*.');
```

### 3. With Math Formulas (KaTeX)

```typescript
import { Parser, HTMLRenderer } from 'mdparser-cf';

const markdown = `
# Physics Formula

Einstein's equation: $E = mc^2$

Detailed derivation:
$$
E = \\gamma mc^2 = \\frac{mc^2}{\\sqrt{1-\\frac{v^2}{c^2}}}
$$
`;

const parser = new Parser({ enableMath: true });
const ast = parser.parse(markdown);

const renderer = new HTMLRenderer();
const { html } = renderer.render(ast);
```

**Note:** Include KaTeX CSS in your HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.css" />
```

### 4. Chemistry with mhchem

```typescript
const markdown = `
Water: $\\ce{H2O}$

Reaction: $\\ce{2H2 + O2 -> 2H2O}$
`;

const parser = new Parser({ enableMath: true, enablePlugins: true });
const ast = parser.parse(markdown);
const renderer = new HTMLRenderer();
const { html } = renderer.render(ast);
```

### 5. Tables

```typescript
const markdown = `
| Name  | Age | City      |
|-------|-----|-----------|
| Alice | 30  | New York  |
| Bob   | 25  | London    |
`;

const parser = new Parser();
const { html } = parser.parse(markdown).then((ast) => new HTMLRenderer().render(ast).html);
```

### 6. Task Lists (Checkboxes)

```typescript
const markdown = `
## Project Checklist

- [x] Design mockups complete
- [x] Backend API implemented
- [ ] Frontend integration
- [ ] Testing and QA
- [ ] Deploy to production
`;

const parser = new Parser();
const ast = parser.parse(markdown);
const renderer = new HTMLRenderer();
const { html } = renderer.render(ast);

// Output includes:
// <ul class="task-list">
//   <li class="task-list-item"><input type="checkbox" disabled checked> Design mockups complete</li>
//   ...
// </ul>
```

Task list syntax:

- `- [ ]` - Unchecked checkbox
- `- [x]` or `- [X]` - Checked checkbox
- Works with both unordered (`-`, `*`, `+`) and ordered (`1.`) lists
- Can be mixed with regular list items

### 7. Get AST Only (for custom processing)

```typescript
import { Parser, type Document } from 'mdparser-cf';

const parser = new Parser();
const ast: Document = parser.parse('# Hello');

console.log(JSON.stringify(ast, null, 2));
// {
//   "type": "document",
//   "children": [{
//     "type": "heading",
//     "level": 1,
//     "children": [{"type": "text", "value": "Hello"}]
//   }]
// }
```

### 8. Extract Headings for Table of Contents

```typescript
import { Parser, HTMLRenderer } from 'mdparser-cf';

const markdown = `
# Chapter 1
## Section 1.1
## Section 1.2
# Chapter 2
`;

const parser = new Parser();
const ast = parser.parse(markdown);
const renderer = new HTMLRenderer();
const output = renderer.render(ast);

console.log(output.headings);
// [
//   { level: 1, text: 'Chapter 1' },
//   { level: 2, text: 'Section 1.1' },
//   { level: 2, text: 'Section 1.2' },
//   { level: 1, text: 'Chapter 2' }
// ]
```

## 🔧 Configuration Options

### Parser Options

```typescript
import { Parser, type ParserOptions } from 'mdparser-cf';

const options: ParserOptions = {
  enableMath: true, // Enable $...$ and $$...$$ math formulas
  enablePlugins: true, // Enable plugin system (emoji, etc.)
  debugAST: false, // Log AST to console (for debugging)
};

const parser = new Parser(options);
```

### Renderer Options

```typescript
import { HTMLRenderer, type RendererOptions } from 'mdparser-cf';

const options: RendererOptions = {
  // Add custom options here
};

const renderer = new HTMLRenderer(options);
```

## 🌐 Framework Integration Examples

### React

```tsx
import { useEffect, useState } from 'react';
import { mdToHtml } from 'mdparser-cf';

function MarkdownViewer({ markdown }: { markdown: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    mdToHtml(markdown).then(setHtml);
  }, [markdown]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Vue 3

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { mdToHtml } from 'mdparser-cf';

const props = defineProps<{ markdown: string }>();
const html = ref('');

watch(
  () => props.markdown,
  async (newMd) => {
    html.value = await mdToHtml(newMd);
  },
  { immediate: true }
);
</script>

<template>
  <div v-html="html"></div>
</template>
```

### Express.js API

```javascript
import express from 'express';
import { Parser, HTMLRenderer } from 'mdparser-cf';

const app = express();
app.use(express.json());

app.post('/api/render', (req, res) => {
  const { markdown } = req.body;

  const parser = new Parser({ enableMath: true });
  const ast = parser.parse(markdown);

  const renderer = new HTMLRenderer();
  const { html } = renderer.render(ast);

  res.json({ html });
});

app.listen(3000);
```

### Next.js API Route

```typescript
// pages/api/markdown.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { mdToHtml } from 'mdparser-cf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { markdown } = req.body;
  const html = await mdToHtml(markdown);
  res.status(200).json({ html });
}
```

### Cloudflare Worker

```typescript
import { Parser, HTMLRenderer } from 'mdparser-cf';

export default {
  async fetch(request: Request): Promise<Response> {
    const { markdown } = await request.json();

    const parser = new Parser({ enableMath: true });
    const ast = parser.parse(markdown);

    const renderer = new HTMLRenderer();
    const { html } = renderer.render(ast);

    return new Response(JSON.stringify({ html }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
```

## 📝 Complete Example: Blog Post Renderer

```typescript
import { Parser, HTMLRenderer } from 'mdparser-cf';

interface BlogPost {
  title: string;
  content: string;
  html?: string;
  headings?: Array<{ level: number; text: string }>;
}

function renderBlogPost(post: BlogPost): BlogPost {
  const fullMarkdown = `# ${post.title}\n\n${post.content}`;

  const parser = new Parser({ enableMath: true, enablePlugins: true });
  const ast = parser.parse(fullMarkdown);

  const renderer = new HTMLRenderer();
  const output = renderer.render(ast);

  return {
    ...post,
    html: output.html,
    headings: output.headings,
  };
}

// Usage
const post = {
  title: 'My Blog Post',
  content: 'This is **important** content with $E=mc^2$.',
};

const rendered = renderBlogPost(post);
console.log(rendered.html);
console.log(rendered.headings); // For TOC
```

## 🎨 Styling

Don't forget to include CSS for KaTeX and code highlighting:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- KaTeX for math rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.css" />

    <!-- Highlight.js for code syntax highlighting (optional) -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css"
    />

    <!-- Your custom styles -->
    <style>
      /* Style tables */
      table {
        border-collapse: collapse;
      }
      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
      }

      /* Style code blocks */
      pre {
        background: #f5f5f5;
        padding: 1em;
        border-radius: 4px;
      }
      code {
        font-family: 'Courier New', monospace;
      }

      /* Style math blocks */
      .math-block {
        margin: 1em 0;
        overflow-x: auto;
      }
    </style>
  </head>
  <body>
    <div id="content"></div>
  </body>
</html>
```

## 🔗 TypeScript Support

Full TypeScript definitions are included:

```typescript
import type {
  Document,
  BlockNode,
  InlineNode,
  Paragraph,
  Heading,
  ParserOptions,
  HTMLOutput,
} from 'mdparser-cf';
```

## 📚 API Reference

See full documentation in the [README.md](../README.md) and [API documentation](../docs/).

## ⚠️ Important Notes

1. **KaTeX CSS Required**: For math rendering, include KaTeX CSS in your HTML
2. **Bundle Size**: ~482KB (ESM) / ~326KB (UMD), ~117KB gzipped
3. **Browser Compatibility**: ES2022+ required
4. **Node.js**: Version 18+ required

## 🐛 Troubleshooting

### Math formulas not rendering

Make sure KaTeX CSS is loaded:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.css" />
```

### TypeScript errors

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

### Import errors in Node.js

Make sure your `package.json` has:

```json
{
  "type": "module"
}
```

Or use `.mjs` file extension.

---

**Need more help?** Check the [examples](../examples/) folder or open an issue on GitHub!
