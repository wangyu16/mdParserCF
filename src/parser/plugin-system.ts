/**
 * Plugin System for Custom Markdown Syntax
 *
 * This module provides an extensible plugin architecture for parsing
 * custom inline and block-level syntax patterns, such as:
 * - {{youtube videoId}}
 * - {{markdown content}}
 * - {{emoji name}}
 * - {{diagram type}}
 *
 * Plugins are classified along two independent axes:
 * 1. Input Type: The format of the plugin content
 *    - 'inline': Single-line content (e.g., {{youtube id}})
 *    - 'block': Multi-line content (e.g., {{diagram mermaid\n...\n}})
 * 2. Output Type: What HTML element type is produced
 *    - 'inline': Produces inline elements (<span>, <img>, etc.)
 *    - 'block': Produces block elements (<div>, <iframe>, etc.)
 *
 * Parsing behavior is derived from these types:
 * - If BOTH inputType AND outputType are 'inline' → parsed inline within text
 * - If EITHER inputType OR outputType is 'block' → parsed at block level
 *
 * See PLUGIN.md for detailed documentation.
 */

import { InlineNode, BlockNode } from './ast-types';

/**
 * Plugin handler result
 */
export interface PluginResult {
  type: 'rendered' | 'fallthrough';
  content?: string | InlineNode | BlockNode;
  asyncData?: any; // Data needed for async processing
}

/**
 * Plugin handler function - processes plugin syntax
 * Async plugins should return placeholders synchronously;
 * actual async work is done in post-processing
 */
export type PluginHandler = (content: string) => PluginResult;

/**
 * Plugin definition with separate input and output type classification
 *
 * @property name - Plugin identifier (e.g., 'youtube', 'emoji')
 * @property aliases - Alternative names (e.g., 'md' for 'markdown')
 * @property isAsync - Whether this plugin requires async processing (default: false)
 * @property inputType - Format of plugin content:
 *   - 'inline': Single-line content
 *   - 'block': Multi-line content
 * @property outputType - What HTML type is produced:
 *   - 'inline': Produces inline elements (<span>, <img>, etc.)
 *   - 'block': Produces block elements (<div>, <iframe>, etc.)
 * @property pattern - Regex to match plugin syntax
 * @property handler - Function to process matched content
 *
 * Parsing behavior:
 * - inline/inline → parsed within paragraph text (true inline)
 * - inline/block, block/inline, block/block → parsed at block level
 */
export interface Plugin {
  name: string;
  aliases?: string[];
  isAsync?: boolean; // NEW: Flag for async plugins
  inputType: 'inline' | 'block';
  outputType: 'inline' | 'block';
  pattern: RegExp;
  handler: PluginHandler;
}

/**
 * Helper to determine if a plugin should be parsed at block level
 */
export function isBlockParsedPlugin(plugin: Plugin): boolean {
  return plugin.inputType === 'block' || plugin.outputType === 'block';
}

/**
 * Legacy plugin type alias for backward compatibility
 * @deprecated Use Plugin with inputType/outputType instead
 */
export interface LegacyPlugin {
  name: string;
  pattern: RegExp;
  handler: PluginHandler;
  type: 'inline' | 'block';
}

// Type aliases for backward compatibility
export type InlinePluginHandler = PluginHandler;
export type BlockPluginHandler = PluginHandler;

/**
 * Plugin registry to manage all custom plugins
 *
 * Plugins are organized by their PARSING behavior:
 * - Inline-parsed plugins: Both inputType AND outputType are 'inline'
 * - Block-parsed plugins: Either inputType OR outputType is 'block'
 */
export class PluginRegistry {
  private inlinePlugins: Map<string, Plugin> = new Map();
  private blockPlugins: Map<string, Plugin> = new Map();

  /**
   * Register a plugin (auto-detects parsing behavior)
   */
  public registerPlugin(plugin: Plugin): void {
    if (isBlockParsedPlugin(plugin)) {
      this.registerBlockPlugin(plugin);
    } else {
      this.registerInlinePlugin(plugin);
    }
  }

  /**
   * Register a plugin to be parsed inline (only for inline/inline plugins)
   */
  public registerInlinePlugin(plugin: Plugin): void {
    if (isBlockParsedPlugin(plugin)) {
      throw new Error(
        `Plugin ${plugin.name} has block input or output and must be registered as block-parsed`
      );
    }
    this.inlinePlugins.set(plugin.name, plugin);
    // Register aliases
    if (plugin.aliases) {
      for (const alias of plugin.aliases) {
        this.inlinePlugins.set(alias, plugin);
      }
    }
  }

  /**
   * Register a plugin to be parsed at block level
   */
  public registerBlockPlugin(plugin: Plugin): void {
    if (!isBlockParsedPlugin(plugin)) {
      throw new Error(
        `Plugin ${plugin.name} is inline/inline and should be registered as inline-parsed`
      );
    }
    this.blockPlugins.set(plugin.name, plugin);
    // Register aliases
    if (plugin.aliases) {
      for (const alias of plugin.aliases) {
        this.blockPlugins.set(alias, plugin);
      }
    }
  }

  /**
   * Get all inline-parsed plugins (unique, excluding aliases)
   * These are plugins where BOTH inputType AND outputType are 'inline'
   */
  public getInlinePlugins(): Plugin[] {
    const seen = new Set<string>();
    const plugins: Plugin[] = [];
    for (const plugin of this.inlinePlugins.values()) {
      if (!seen.has(plugin.name)) {
        seen.add(plugin.name);
        plugins.push(plugin);
      }
    }
    return plugins;
  }

  /**
   * Get all block-parsed plugins (unique, excluding aliases)
   * These are plugins where EITHER inputType OR outputType is 'block'
   */
  public getBlockPlugins(): Plugin[] {
    const seen = new Set<string>();
    const plugins: Plugin[] = [];
    for (const plugin of this.blockPlugins.values()) {
      if (!seen.has(plugin.name)) {
        seen.add(plugin.name);
        plugins.push(plugin);
      }
    }
    return plugins;
  }

  /**
   * Get a specific plugin by name or alias
   */
  public getPlugin(name: string): Plugin | undefined {
    return this.inlinePlugins.get(name) || this.blockPlugins.get(name);
  }

  /**
   * Remove a plugin and its aliases
   */
  public removePlugin(name: string): void {
    const plugin = this.getPlugin(name);
    if (plugin) {
      this.inlinePlugins.delete(plugin.name);
      this.blockPlugins.delete(plugin.name);
      if (plugin.aliases) {
        for (const alias of plugin.aliases) {
          this.inlinePlugins.delete(alias);
          this.blockPlugins.delete(alias);
        }
      }
    }
  }

  /**
   * Clear all plugins
   */
  public clearPlugins(): void {
    this.inlinePlugins.clear();
    this.blockPlugins.clear();
  }
}

/**
 * Built-in plugin implementations
 */

/**
 * YouTube embed plugin
 * Syntax: {{youtube videoId}}
 *
 * Input: Inline (single-line video ID)
 * Output: Block (iframe element)
 */
export const youtubePlugin: Plugin = {
  name: 'youtube',
  aliases: ['yt'],
  inputType: 'inline',
  outputType: 'block',
  pattern: /\{\{(?:youtube|yt)\s+([a-zA-Z0-9_-]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{(?:youtube|yt)\s+([a-zA-Z0-9_-]+)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const videoId = match[1];
    const html = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: html,
      } as InlineNode,
    };
  },
};

/**
 * Emoji plugin
 * Syntax: {{emoji smile}} or {{emoji 😀}}
 *
 * Input: Inline (single-line emoji name)
 * Output: Inline (text/emoji character)
 */
export const emojiPlugin: Plugin = {
  name: 'emoji',
  aliases: ['em'],
  inputType: 'inline',
  outputType: 'inline',
  pattern: /\{\{(?:emoji|em)\s+([\w\d\s-]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{(?:emoji|em)\s+([\w\d\s-]+)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const emojiMap: Record<string, string> = {
      smile: '😊',
      laugh: '😄',
      happy: '😃',
      sad: '😢',
      angry: '😠',
      thumbsup: '👍',
      thumbsdown: '👎',
      heart: '❤️',
      star: '⭐',
      fire: '🔥',
      rocket: '🚀',
      party: '🎉',
      thinking: '🤔',
      eyes: '👀',
      check: '✅',
      cross: '❌',
    };

    const emojiName = match[1].toLowerCase().trim();
    const emoji = emojiMap[emojiName] || emojiName;

    return {
      type: 'rendered',
      content: {
        type: 'text',
        value: emoji,
      } as InlineNode,
    };
  },
};

/**
 * SMILES (chemical notation) plugin
 * Syntax: {{smiles CCCO}}
 *
 * Input: Inline (single-line SMILES notation)
 * Output: Block (container div with canvas element)
 *
 * Note: SmilesDrawer requires a DOM/Canvas environment which isn't available
 * in server-side Node.js. For production use, this plugin generates placeholder
 * elements that can be rendered client-side with SmilesDrawer.js loaded in the browser.
 *
 * The generated HTML includes:
 * - Canvas element with data-smiles attribute
 * - Script loading SmilesDrawer library
 * - Client-side rendering instructions
 */
export const smilesPlugin: Plugin = {
  name: 'smiles',
  aliases: ['sm'],
  inputType: 'inline',
  outputType: 'block',
  pattern: /\{\{(?:smiles|sm)\s+([A-Za-z0-9\-()=#+\\\/%@\[\]]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{(?:smiles|sm)\s+([A-Za-z0-9\-()=#+\\\/%@\[\]]+)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const smilesString = match[1];
    const canvasId = `smiles-${Math.random().toString(36).substr(2, 9)}`;

    // Generate HTML with canvas and client-side rendering script
    // This allows SmilesDrawer to render the structure when loaded in browser
    const html = `<div class="smiles-container" style="display: inline-block; margin: 0.2em; text-align: center;">
<canvas id="${canvasId}" data-smiles="${smilesString}" width="300" height="300" style="border: 1px solid #ddd; border-radius: 0.25em;"></canvas>
<script>
// Client-side SmilesDrawer rendering
if (typeof SmilesDrawer !== 'undefined') {
  try {
    const canvas = document.getElementById('${canvasId}');
    const smiles = canvas.dataset.smiles;
    const drawer = new SmilesDrawer.Drawer({width: 300, height: 300});
    SmilesDrawer.parse(smiles, function(tree) {
      drawer.draw(tree, canvas, 'light', false);
    }, function(error) {
      console.error('SMILES parsing error:', error);
      const ctx = canvas.getContext('2d');
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#d00';
      ctx.fillText('Invalid SMILES', 10, 20);
    });
  } catch (e) {
    console.error('Error rendering SMILES:', e);
  }
}
</script>
</div>`;

    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: html,
      } as InlineNode,
    };
  },
};

/**
 * QR Code plugin
 * Syntax: {{qrcode Hello World}} or {{qr https://example.com}}
 *
 * Input: Inline (single-line text to encode)
 * Output: Block (image element with QR code)
 *
 * Generates QR codes using cloud API (https://yw-qrcode.deno.dev/)
 * This is an async plugin that returns a placeholder during parsing,
 * then the actual QR code is fetched during post-processing.
 */
export const qrcodePlugin: Plugin = {
  name: 'qrcode',
  aliases: ['qr'],
  isAsync: true, // Mark as async plugin
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

    // For async plugins, we generate a placeholder during parsing
    // The actual API call will be made during post-processing
    const placeholder = `<div id="${qrcodeId}" class="async-plugin-placeholder" data-plugin="qrcode" data-qrcode-text="${escapeHtml(text)}" data-api-url="${escapeHtml(apiUrl)}" style="margin: 1em 0; text-align: center;">
<div style="padding: 20px; border: 1px solid #ddd; background: #f5f5f5;">Loading QR code...</div>
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

/**
 * Badge/Alert plugin
 * Syntax: {{badge success: Text}} or {{badge warning: Important}}
 *
 * Input: Inline (single-line type and text)
 * Output: Inline (span element with badge styling)
 */
export const badgePlugin: Plugin = {
  name: 'badge',
  aliases: ['bd'],
  inputType: 'inline',
  outputType: 'inline',
  pattern: /\{\{(?:badge|bd)\s+(\w+)\s*:\s*([^}]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{(?:badge|bd)\s+(\w+)\s*:\s*([^}]+)\}\}/);
    if (!match || !match[1] || !match[2]) {
      return { type: 'fallthrough' };
    }

    const badgeType = match[1].toLowerCase();
    const badgeText = match[2].trim();
    const validTypes = ['success', 'danger', 'warning', 'info', 'primary', 'secondary'];
    const type = validTypes.includes(badgeType) ? badgeType : 'info';

    const html = `<span class="badge badge-${type}">${badgeText}</span>`;

    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: html,
      } as InlineNode,
    };
  },
};

/**
 * Mermaid diagram plugin
 * Syntax: {{mermaid
 *   graph TD
 *   A --> B
 * }}
 *
 * Input: Block (multi-line diagram definition)
 * Output: Block (div element with diagram content)
 */
export const mermaidPlugin: Plugin = {
  name: 'mermaid',
  aliases: ['mm'],
  inputType: 'block',
  outputType: 'block',
  pattern: /\{\{(?:mermaid|mm)\s*\n([\s\S]*?)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{(?:mermaid|mm)\s*\n([\s\S]*?)\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const diagramContent = match[1].trim();

    const html = `<div class="mermaid">${diagramContent}</div><script async src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"><\/script>`;
    return {
      type: 'rendered',
      content: {
        type: 'html-block',
        content: html,
      } as BlockNode,
    };
  },
};

/**
 * Markdown/MD embed plugin
 * Syntax: {{markdown https://example.com/file.md}}
 *         {{md https://example.com/file.md}}
 *
 * Input: Inline (single-line URL)
 * Output: Block (div element with embedded content)
 *
 * Embeds external markdown content from a URL.
 * The content is fetched and rendered recursively.
 *
 * This plugin generates a placeholder that can be:
 * 1. Processed server-side (in Cloudflare Workers) for pre-rendered content
 * 2. Processed client-side via JavaScript for browser rendering
 *
 * Security considerations:
 * - Only HTTPS URLs are allowed
 * - Content is sanitized during markdown parsing
 * - A maximum recursion depth prevents infinite loops
 */
export const markdownPlugin: Plugin = {
  name: 'markdown',
  aliases: ['md'],
  inputType: 'inline',
  outputType: 'block',
  pattern: /\{\{(?:markdown|md)\s+(https?:\/\/[^\s}]+)\s*\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{(?:markdown|md)\s+(https?:\/\/[^\s}]+)\s*\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const url = match[1].trim();

    // Validate URL format
    try {
      const parsedUrl = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
          type: 'rendered',
          content: {
            type: 'html-block',
            content: `<div class="markdown-embed-error">Invalid URL protocol: only HTTP(S) allowed</div>`,
          } as BlockNode,
        };
      }
    } catch {
      return {
        type: 'rendered',
        content: {
          type: 'html-block',
          content: `<div class="markdown-embed-error">Invalid URL format</div>`,
        } as BlockNode,
      };
    }

    // Generate placeholder with data attribute for server-side or client-side processing
    // The placeholder includes a unique ID for targeting
    const embedId = `md-embed-${Math.random().toString(36).substr(2, 9)}`;

    const html = `<div id="${embedId}" class="markdown-embed" data-markdown-url="${escapeHtml(url)}">
<div class="markdown-embed-loading">Loading content from <a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>...</div>
</div>`;

    return {
      type: 'rendered',
      content: {
        type: 'html-block',
        content: html,
      } as BlockNode,
    };
  },
};

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Create default plugin registry with built-in plugins
 */
export function createDefaultPluginRegistry(): PluginRegistry {
  const registry = new PluginRegistry();

  // Inline-parsed plugins (both inputType AND outputType are 'inline')
  registry.registerPlugin(emojiPlugin); // inline/inline
  registry.registerPlugin(badgePlugin); // inline/inline

  // Block-parsed plugins (either inputType OR outputType is 'block')
  registry.registerPlugin(youtubePlugin); // inline/block
  registry.registerPlugin(smilesPlugin); // inline/block
  registry.registerPlugin(qrcodePlugin); // inline/block
  registry.registerPlugin(markdownPlugin); // inline/block (with 'md' alias)
  registry.registerPlugin(mermaidPlugin); // block/block

  return registry;
}
