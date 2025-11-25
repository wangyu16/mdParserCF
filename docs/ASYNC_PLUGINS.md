# Async Plugin System

## Overview

The async plugin system allows plugins to fetch external resources during rendering without blocking the main parser. This is achieved through a two-phase approach:

1. **Parse Phase**: Plugins return placeholder HTML with metadata (synchronous)
2. **Post-Processing Phase**: Placeholders are replaced with actual content (asynchronous)

## Architecture

```
┌─────────────────┐
│  Parse Markdown │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Plugin Handler │ ← Returns placeholder synchronously
│  (Synchronous)  │   with data attributes
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Render to HTML │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Post-Processor  │ ← Processes async plugins
│  (Asynchronous) │   fetches external resources
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Final HTML    │
└─────────────────┘
```

## Creating an Async Plugin

### 1. Define the Plugin

```typescript
import { Plugin, PluginResult, BlockNode } from './plugin-system';

export const myAsyncPlugin: Plugin = {
  name: 'myasync',
  aliases: ['ma'],
  isAsync: true, // Mark as async
  inputType: 'inline',
  outputType: 'block',
  pattern: /\{\{myasync\s+([^}]+)\}\}/g,

  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{myasync\s+([^}]+)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const data = match[1].trim();
    const id = `myasync-${Math.random().toString(36).substr(2, 9)}`;
    const apiUrl = `https://api.example.com/data?q=${encodeURIComponent(data)}`;

    // Return placeholder with data attributes
    const placeholder = `<div id="${id}" class="async-plugin-placeholder" 
      data-plugin="myasync" 
      data-query="${escapeHtml(data)}" 
      data-api-url="${escapeHtml(apiUrl)}" 
      style="margin: 1em 0;">
      <div style="padding: 20px; border: 1px solid #ddd; background: #f5f5f5;">
        Loading...
      </div>
    </div>`;

    return {
      type: 'rendered',
      content: {
        type: 'html-block',
        content: placeholder,
      } as BlockNode,
      asyncData: {
        id,
        data,
        apiUrl,
      },
    };
  },
};
```

### 2. Add Post-Processor Handler

In `src/parser/async-plugin-processor.ts`:

```typescript
async function processMyAsyncPlugin(id: string, query: string, apiUrl: string): Promise<string> {
  try {
    // Fetch data from API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'mdParserCF/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    // Generate final HTML
    const html = `<div id="${id}" class="myasync-container" 
      data-query="${escapeHtml(query)}" 
      style="margin: 1em 0;">
      <div class="content">${escapeHtml(JSON.stringify(data))}</div>
    </div>`;

    return html;
  } catch (error: any) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}
```

### 3. Register in Post-Processor

In `processAsyncPlugins()`:

```typescript
for (const placeholder of placeholders) {
  try {
    if (placeholder.plugin === 'qrcode') {
      const replacement = await processQRCodePlugin(
        placeholder.id,
        placeholder.text,
        placeholder.apiUrl
      );
      processedHtml = processedHtml.replace(placeholder.fullMatch, replacement);
    } else if (placeholder.plugin === 'myasync') {
      const replacement = await processMyAsyncPlugin(
        placeholder.id,
        placeholder.query,
        placeholder.apiUrl
      );
      processedHtml = processedHtml.replace(placeholder.fullMatch, replacement);
    }
    // Add more async plugin types here
  } catch (error: any) {
    // Error handling...
  }
}
```

## Example: QR Code Plugin

### Usage

```markdown
Generate a QR code:

{{qr https://github.com}}

Or with text:

{{qrcode Hello World!}}
```

### Implementation

```typescript
export const qrcodePlugin: Plugin = {
  name: 'qrcode',
  aliases: ['qr'],
  isAsync: true,
  inputType: 'inline',
  outputType: 'block',
  pattern: /\{\{(?:qrcode|qr)\s+([^}]+)\}\}/g,

  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{(?:qrcode|qr)\s+([^}]+)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const text = match[1].trim();
    const qrcodeId = `qr-${Math.random().toString(36).substr(2, 9)}`;
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://yw-qrcode.deno.dev/api/generate?text=${encodedText}&format=raw`;

    const placeholder = `<div id="${qrcodeId}" 
      class="async-plugin-placeholder" 
      data-plugin="qrcode" 
      data-qrcode-text="${escapeHtml(text)}" 
      data-api-url="${escapeHtml(apiUrl)}" 
      style="margin: 1em 0; text-align: center;">
      <div style="padding: 20px; border: 1px solid #ddd; background: #f5f5f5;">
        Loading QR code...
      </div>
    </div>`;

    return {
      type: 'rendered',
      content: {
        type: 'html-block',
        content: placeholder,
      } as BlockNode,
      asyncData: {
        id: qrcodeId,
        text,
        apiUrl,
      },
    };
  },
};
```

### Post-Processor

```typescript
async function processQRCodePlugin(id: string, text: string, apiUrl: string): Promise<string> {
  try {
    // Verify the API endpoint is accessible
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'mdParserCF/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    // Generate final HTML with the QR code image
    const html = `<div id="${id}" class="qrcode-container" 
      data-qrcode-text="${escapeHtml(text)}" 
      style="margin: 1em 0; text-align: center;">
      <img src="${apiUrl}" 
        alt="QR Code: ${escapeHtml(text)}" 
        style="max-width: 300px; height: auto; border: 1px solid #ddd; 
               padding: 10px; background: white;" 
        loading="lazy" 
        crossorigin="anonymous" 
        referrerpolicy="no-referrer" />
      <p style="font-size: 0.85em; color: #666; margin-top: 0.5em;">
        ${escapeHtml(text)}
      </p>
    </div>`;

    return html;
  } catch (error: any) {
    throw new Error(`Failed to fetch QR code: ${error.message}`);
  }
}
```

## Using Async Plugins

### In Node.js

```typescript
import { mdToHtml } from 'mdparser-cf';

const markdown = '# QR Code Demo\n\n{{qr https://example.com}}';

// Async processing is enabled by default
const html = await mdToHtml(markdown);

// To disable async processing
const htmlSync = await mdToHtml(markdown, { processAsync: false });
```

### In Cloudflare Worker

Async processing works automatically in the worker:

```typescript
import { processAsyncPlugins } from '../parser/async-plugin-processor';

// In the worker handler
const renderer = new HTMLRenderer();
const output = renderer.render(ast);
let html = output.html;

// Process async plugins
html = await processAsyncPlugins(html);
```

### CLI Tool

```bash
# Local parser (with async processing)
node convert-md-to-html.js input.md output.html

# Cloudflare API (with async processing)
node convert-md-to-html.js input.md output.html api
```

## API Reference

### Plugin Interface

```typescript
interface Plugin {
  name: string;
  aliases?: string[];
  isAsync?: boolean; // Mark as async plugin
  inputType: 'inline' | 'block';
  outputType: 'inline' | 'block';
  pattern: RegExp;
  handler: PluginHandler;
}
```

### PluginResult Interface

```typescript
interface PluginResult {
  type: 'rendered' | 'fallthrough';
  content?: InlineNode | BlockNode;
  asyncData?: any; // Data for post-processing
}
```

### processAsyncPlugins Function

```typescript
async function processAsyncPlugins(html: string): Promise<string>;
```

Processes all async plugin placeholders in the HTML string.

**Parameters:**

- `html` - HTML string with async plugin placeholders

**Returns:**

- Promise resolving to HTML with placeholders replaced by actual content

**Usage:**

```typescript
const html = renderer.render(ast).html;
const finalHtml = await processAsyncPlugins(html);
```

## Best Practices

1. **Use Async Only When Needed**: Only mark plugins as async if they need to fetch external resources.

2. **Error Handling**: Always handle errors in post-processor handlers. Failed async plugins should show error messages instead of breaking the entire page.

3. **Unique IDs**: Generate unique IDs for placeholders to avoid conflicts.

4. **Data Attributes**: Store all necessary data in data attributes for the post-processor.

5. **Loading States**: Show meaningful loading states in placeholders.

6. **Timeouts**: Consider adding timeouts to fetch requests:

   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 5000);

   const response = await fetch(url, {
     signal: controller.signal,
   });

   clearTimeout(timeoutId);
   ```

7. **Caching**: Consider caching API responses to reduce redundant requests.

8. **Rate Limiting**: Be mindful of API rate limits when processing multiple async plugins.

## Performance Considerations

- **Parallel Processing**: The post-processor processes async plugins sequentially. Consider parallelizing if needed.
- **Worker Limits**: Cloudflare Workers have CPU time limits. Avoid processing too many async plugins in one request.
- **Bundle Size**: Async plugin code adds ~1.7KB to the bundle size.

## Troubleshooting

### Placeholders Not Being Replaced

Check that:

1. Plugin is marked with `isAsync: true`
2. Placeholder has correct `class="async-plugin-placeholder"`
3. Post-processor handler is registered for the plugin
4. `processAsyncPlugins()` is called after rendering

### API Fetch Failing

Common issues:

1. CORS errors (check API headers)
2. API down or rate-limited
3. Network timeouts
4. Invalid API URL encoding

### Tests Failing

Remember to update tests when converting plugins to async:

```typescript
// Before: Expected final output
expect(node.content).toContain('qrcode-container');

// After: Expected placeholder
expect(node.content).toContain('async-plugin-placeholder');
expect(node.content).toContain('data-plugin="qrcode"');
```

## See Also

- [Plugin System Documentation](./PLUGINS.md)
- [Cloudflare Worker Setup](./CLOUDFLARE_SETUP.md)
- [Testing Guide](./TESTING.md)
