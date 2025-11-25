# Plugin System Design

This document describes the design and architecture of the mdParserCF plugin system.

## Overview

The plugin system allows extending the markdown parser with custom syntax patterns using the `{{pluginName ...}}` notation. Plugins can transform custom syntax into HTML elements during parsing.

## Plugin Classification

Plugins are classified along two independent axes:

### 1. Input Type

Describes the format of the plugin content:

| Input Type | Description                                | Example                       |
| ---------- | ------------------------------------------ | ----------------------------- |
| **Inline** | Single-line content within `{{...}}`       | `{{youtube dQw4w9WgXcQ}}`     |
| **Block**  | Multi-line content spanning multiple lines | `{{diagram mermaid \n...\n}}` |

### 2. Output Type

Describes the HTML element type produced:

| Output Type | Description                        | HTML Result                           |
| ----------- | ---------------------------------- | ------------------------------------- |
| **Inline**  | Produces inline HTML elements      | `<span>`, `<img>`, `<a>`, etc.        |
| **Block**   | Produces block-level HTML elements | `<div>`, `<iframe>`, `<figure>`, etc. |

### Parsing Behavior

The **parsing behavior** is derived from the combination of input and output types:

| Combination   | Parsing Behavior  | Description                     |
| ------------- | ----------------- | ------------------------------- |
| Inline/Inline | **Inline-parsed** | Processed within paragraph text |
| Inline/Block  | **Block-parsed**  | Processed at block level        |
| Block/Inline  | **Block-parsed**  | Processed at block level        |
| Block/Block   | **Block-parsed**  | Processed at block level        |

**Rule**: If **either** inputType **or** outputType is `'block'`, the plugin is parsed at block level.

### Classification Matrix

| Plugin     | Input Type | Output Type | Parsing | Example                                                     |
| ---------- | ---------- | ----------- | ------- | ----------------------------------------------------------- |
| `emoji`    | Inline     | Inline      | Inline  | `{{emoji smile}}` → `😊`                                    |
| `badge`    | Inline     | Inline      | Inline  | `{{badge info: Note}}` → `<span class="badge">`             |
| `youtube`  | Inline     | Block       | Block   | `{{youtube dQw4w9WgXcQ}}` → `<iframe>`                      |
| `smiles`   | Inline     | Block       | Block   | `{{smiles CCO}}` → `<div class="smiles-container">`         |
| `markdown` | Inline     | Block       | Block   | `{{markdown https://...}}` → `<div class="markdown-embed">` |
| `diagram`  | Block      | Block       | Block   | `{{diagram mermaid\n...\n}}` → `<div class="mermaid">`      |

## Plugin Interface

```typescript
interface Plugin {
  name: string; // Plugin identifier (e.g., 'youtube', 'emoji')
  aliases?: string[]; // Alternative names (e.g., 'md' for 'markdown')
  inputType: 'inline' | 'block'; // Format of plugin content
  outputType: 'inline' | 'block'; // What HTML type it produces
  pattern: RegExp; // Regex to match plugin syntax
  handler: PluginHandler; // Function to process matched content
}

// Helper function to determine parsing behavior
function isBlockParsedPlugin(plugin: Plugin): boolean {
  return plugin.inputType === 'block' || plugin.outputType === 'block';
}

type PluginHandler = (content: string) => PluginResult;

interface PluginResult {
  type: 'rendered' | 'fallthrough';
  content?: InlineNode | BlockNode;
}
```

## Built-in Plugins

### Inline-Parsed Plugins (Inline/Inline)

#### `emoji`

Converts emoji shortcodes to Unicode emoji characters.

```markdown
I'm feeling {{emoji happy}} today!
```

**Output**: `I'm feeling 😃 today!`

**Supported emojis**: smile, laugh, happy, sad, angry, thumbsup, thumbsdown, heart, star, fire, rocket, party, thinking, eyes, check, cross

---

#### `badge`

Creates styled badge/label elements.

```markdown
{{badge success: Completed}} {{badge warning: Pending}}
```

**Output**: `<span class="badge badge-success">Completed</span>`

**Types**: success, danger, warning, info, primary, secondary

---

### Block-Parsed Plugins (Any Block Involvement)

#### `youtube` (Inline/Block)

Embeds YouTube videos.

```markdown
Check out this video: {{youtube dQw4w9WgXcQ}}
```

**Output**:

```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  frameborder="0"
  allowfullscreen
></iframe>
```

---

#### `smiles` (Inline/Block)

Renders chemical structures using SMILES notation (via SmilesDrawer).

```markdown
Ethanol: {{smiles CCO}}
```

**Output**: Container div with canvas element for rendered molecular structure

**Requirements**: SmilesDrawer library loaded in browser

---

#### `markdown` / `md` (Inline/Block)

Embeds external markdown content from a URL.

```markdown
{{markdown https://example.com/content.md}}
{{md https://raw.githubusercontent.com/user/repo/main/README.md}}
```

**Output**: Fetched markdown content rendered in a container div

**Features**:

- Server-side fetching in Cloudflare Workers
- Maximum recursion depth of 3 to prevent infinite loops
- Content size limit of 100KB
- HTTPS URL validation

**Security**: Only HTTP(S) URLs are allowed. Content is sanitized during markdown parsing.

---

#### `diagram` (Block/Block)

Renders diagrams using Mermaid.js or other diagramming libraries.

```markdown
{{diagram mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]
}}
```

**Output**:

```html
<div class="mermaid">graph TD A[Start] --> B{Decision} ...</div>
```

**Supported types**: mermaid (more can be added)

---

## Creating Custom Plugins

### Step 1: Define the Plugin

```typescript
import { Plugin, PluginResult, InlineNode } from './plugin-system';

export const myPlugin: Plugin = {
  name: 'myplugin',
  inputType: 'inline',
  outputType: 'inline',
  pattern: /\{\{myplugin\s+([^}]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{myplugin\s+([^}]+)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const value = match[1].trim();

    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: `<span class="my-plugin">${value}</span>`,
      } as InlineNode,
    };
  },
};
```

### Step 2: Register the Plugin

```typescript
import { createDefaultPluginRegistry } from './plugin-system';

const registry = createDefaultPluginRegistry();
registry.registerPlugin(myPlugin);
```

### Step 3: Use in Markdown

```markdown
Here is {{myplugin my content}} in a paragraph.
```

---

## Pattern Guidelines

### Inline Input Patterns

For plugins that consume single-line input:

```typescript
// Simple: capture everything until }}
pattern: /\{\{pluginname\s+([^}]+)\}\}/g;

// With specific format: URL
pattern: /\{\{pluginname\s+(https?:\/\/[^\s}]+)\s*\}\}/g;

// With options: content | options
pattern: /\{\{pluginname\s+([^}|]+)(?:\s*\|\s*([^}]+))?\}\}/g;
```

### Block Input Patterns

For plugins that consume multi-line input:

```typescript
// Multi-line with type specifier
pattern: /\{\{pluginname\s+(\w+)\s*\n([\s\S]*?)\}\}/g;
```

---

## Processing Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Markdown Source                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Block Plugin Detection                                     │
│  - Scan for {{plugin\n...\n}} patterns                      │
│  - Match against block plugins (inputType: 'block')         │
│  - Replace with HTML blocks                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Standard Block Parsing                                     │
│  - Headers, paragraphs, lists, code blocks, etc.            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Inline Content Processing                                  │
│  - Within paragraphs, list items, etc.                      │
│  - Protect special syntax (code, math, plugins)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Inline Plugin Detection                                    │
│  - Match {{plugin ...}} patterns                            │
│  - Match against inline plugins (inputType: 'inline')       │
│  - Replace with inline/block HTML                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Server-Side Post-Processing (Cloudflare Workers)           │
│  - Process markdown embeds (fetch external content)         │
│  - Apply any deferred transformations                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Final HTML                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### Why Separate Input and Output Types?

The original design conflated input parsing behavior with output rendering type. This led to confusion:

- `youtube` was classified as "inline" but produces block `<iframe>`
- `markdown` takes single-line URL but produces block content

By separating these concerns:

1. **Input type** determines _when_ and _how_ the plugin is matched
2. **Output type** determines _what_ HTML structure is produced

### Why Use Placeholders for Server-Side Plugins?

Some plugins (like `markdown`) require server-side processing that can't happen during initial parsing:

1. Fetching external resources
2. Recursive markdown parsing
3. Security validation

The solution:

1. Parser generates placeholder HTML with data attributes
2. Server-side post-processor finds placeholders
3. Async operations (fetch, parse) complete the transformation
4. Final HTML is assembled

### Why Limit Recursion Depth?

The `markdown` plugin could create infinite loops:

- A.md embeds B.md
- B.md embeds A.md

The `MAX_EMBED_DEPTH = 3` limit prevents this while allowing reasonable nesting.

---

## Future Considerations

### Potential New Plugins

| Plugin     | Input  | Output | Description          |
| ---------- | ------ | ------ | -------------------- |
| `include`  | Inline | Block  | Include local files  |
| `toc`      | Inline | Block  | Table of contents    |
| `footnote` | Block  | Mixed  | Extended footnotes   |
| `tabs`     | Block  | Block  | Tabbed content       |
| `collapse` | Block  | Block  | Collapsible sections |

### Plugin Configuration

Future versions may support global plugin configuration:

```typescript
const registry = createPluginRegistry({
  youtube: { width: 800, height: 450 },
  diagram: { theme: 'dark' },
});
```

---

## Version History

| Version | Changes                                                           |
| ------- | ----------------------------------------------------------------- |
| 1.0.0   | Initial plugin system with youtube, emoji, smiles, badge, diagram |
| 1.1.0   | Added markdown/md plugin for URL embedding                        |
| 1.2.0   | Refactored to separate inputType and outputType (current)         |
