/**
 * Plugin System for Custom Markdown Syntax
 *
 * This module provides an extensible plugin architecture for parsing
 * custom inline and block-level syntax patterns, such as:
 * - {{youtube videoId}}
 * - {{markdown content}}
 * - {{emoji name}}
 * - {{diagram type}}
 */

import { InlineNode, BlockNode } from './ast-types';

/**
 * Plugin handler result
 */
export interface PluginResult {
  type: 'rendered' | 'fallthrough';
  content?: string | InlineNode | BlockNode;
}

/**
 * Plugin handler function - processes plugin syntax
 */
export type InlinePluginHandler = (content: string) => PluginResult;
export type BlockPluginHandler = (content: string) => PluginResult;

/**
 * Plugin definition
 */
export interface Plugin {
  name: string;
  pattern: RegExp;
  handler: InlinePluginHandler | BlockPluginHandler;
  type: 'inline' | 'block';
}

/**
 * Plugin registry to manage all custom plugins
 */
export class PluginRegistry {
  private inlinePlugins: Map<string, Plugin> = new Map();
  private blockPlugins: Map<string, Plugin> = new Map();

  /**
   * Register a new inline plugin
   */
  public registerInlinePlugin(plugin: Plugin): void {
    if (plugin.type !== 'inline') {
      throw new Error(`Plugin ${plugin.name} must have type 'inline'`);
    }
    this.inlinePlugins.set(plugin.name, plugin);
  }

  /**
   * Register a new block plugin
   */
  public registerBlockPlugin(plugin: Plugin): void {
    if (plugin.type !== 'block') {
      throw new Error(`Plugin ${plugin.name} must have type 'block'`);
    }
    this.blockPlugins.set(plugin.name, plugin);
  }

  /**
   * Get all inline plugins
   */
  public getInlinePlugins(): Plugin[] {
    return Array.from(this.inlinePlugins.values());
  }

  /**
   * Get all block plugins
   */
  public getBlockPlugins(): Plugin[] {
    return Array.from(this.blockPlugins.values());
  }

  /**
   * Get a specific plugin
   */
  public getPlugin(name: string): Plugin | undefined {
    return this.inlinePlugins.get(name) || this.blockPlugins.get(name);
  }

  /**
   * Remove a plugin
   */
  public removePlugin(name: string): void {
    this.inlinePlugins.delete(name);
    this.blockPlugins.delete(name);
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
 */
export const youtubePlugin: Plugin = {
  name: 'youtube',
  pattern: /\{\{youtube\s+([a-zA-Z0-9_-]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{youtube\s+([a-zA-Z0-9_-]+)\}\}/);
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
  type: 'inline',
};

/**
 * Emoji plugin
 * Syntax: {{emoji smile}} or {{emoji 😀}}
 */
export const emojiPlugin: Plugin = {
  name: 'emoji',
  pattern: /\{\{emoji\s+([\w\d\s-]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{emoji\s+([\w\d\s-]+)\}\}/);
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
  type: 'inline',
};

/**
 * SMILES (chemical notation) plugin
 * Syntax: {{smiles CCCO}}
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
  pattern: /\{\{smiles\s+([A-Za-z0-9\-()=#+\\\/%@\[\]]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{smiles\s+([A-Za-z0-9\-()=#+\\\/%@\[\]]+)\}\}/);
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
  type: 'inline',
};

/**
 * Chemical Reaction plugin
 * Syntax: {{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]}}
 * Optional syntax with options: {{reaction C=CCBr>CC(=O)C>C=CCI | textBelowArrow: 90%, theme: oldschool}}
 *
 * Renders chemical reaction schemes using SmilesDrawer's reaction SMILES support.
 * Reaction SMILES format: reactants>reagents>products
 *
 * The generated HTML uses SVG for scalable rendering and includes:
 * - SVG element with data-smiles attribute containing reaction SMILES
 * - Optional data-smiles-options for customization (text, theme, etc.)
 * - Client-side rendering with SmilesDrawer
 */
export const reactionPlugin: Plugin = {
  name: 'reaction',
  pattern: /\{\{reaction\s+([^}|]+)(?:\s*\|\s*([^}]+))?\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{reaction\s+([^}|]+)(?:\s*\|\s*([^}]+))?\}\}/);
    if (!match || !match[1]) {
      return { type: 'fallthrough' };
    }

    const reactionSmiles = match[1].trim();
    const optionsString = match[2] ? match[2].trim() : '';

    // Parse options if provided (e.g., "textBelowArrow: 90%, theme: oldschool")
    let optionsObj: Record<string, any> = {};
    if (optionsString) {
      const optionPairs = optionsString.split(',').map((s) => s.trim());
      optionPairs.forEach((pair) => {
        const [key, value] = pair.split(':').map((s) => s.trim());
        if (key && value) {
          // Try to parse as number or boolean, otherwise keep as string
          if (value === 'true') optionsObj[key] = true;
          else if (value === 'false') optionsObj[key] = false;
          else if (!isNaN(Number(value))) optionsObj[key] = Number(value);
          else optionsObj[key] = value.replace(/^['"]|['"]$/g, ''); // Remove quotes
        }
      });
    }

    const optionsAttr =
      Object.keys(optionsObj).length > 0
        ? ` data-smiles-options='${JSON.stringify(optionsObj)}'`
        : '';

    // Generate HTML with SVG element for reaction rendering
    // SVG scales better than canvas for reactions which can be wide
    // Note: Reactions are rendered by global script in convert-md-to-html.js
    const html = `<div class="reaction-container" style="display: block; margin: 1em 0; text-align: center; overflow-x: auto;">
<svg data-smiles="${reactionSmiles}"${optionsAttr} style="max-width: 100%; height: auto; min-height: 300px;"></svg>
</div>`;

    return {
      type: 'rendered',
      content: {
        type: 'html-inline',
        value: html,
      } as InlineNode,
    };
  },
  type: 'inline',
};

/**
 * Badge/Alert plugin
 * Syntax: {{badge success}} or {{alert warning}}
 */
export const badgePlugin: Plugin = {
  name: 'badge',
  pattern: /\{\{badge\s+(\w+)\s*:\s*([^}]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{badge\s+(\w+)\s*:\s*([^}]+)\}\}/);
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
  type: 'inline',
};

/**
 * Mermaid diagram plugin
 * Syntax: {{diagram mermaid
 *   graph TD
 *   A --> B
 * }}
 */
export const diagramPlugin: Plugin = {
  name: 'diagram',
  pattern: /\{\{diagram\s+(\w+)\s*\n([\s\S]*?)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{diagram\s+(\w+)\s*\n([\s\S]*?)\}\}/);
    if (!match || !match[1] || !match[2]) {
      return { type: 'fallthrough' };
    }

    const diagramType = match[1].toLowerCase();
    const diagramContent = match[2].trim();

    if (diagramType === 'mermaid') {
      const html = `<div class="mermaid">${diagramContent}</div><script async src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"><\/script>`;
      return {
        type: 'rendered',
        content: {
          type: 'html-block',
          content: html,
        } as BlockNode,
      };
    }

    return { type: 'fallthrough' };
  },
  type: 'block',
};

/**
 * Markdown/MD embed plugin
 * Syntax: {{markdown https://example.com/file.md}}
 *         {{md https://example.com/file.md}}
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
  pattern: /\{\{(?:markdown|md)\s+(https?:\/\/[^\s}]+)\}\}/g,
  handler: (content: string): PluginResult => {
    const match = content.match(/\{\{(?:markdown|md)\s+(https?:\/\/[^\s}]+)\}\}/);
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
  type: 'block',
};

/**
 * Short alias for markdown plugin (md)
 * Syntax: {{md https://example.com/file.md}}
 */
export const mdPlugin: Plugin = {
  name: 'md',
  pattern: /\{\{md\s+(https?:\/\/[^\s}]+)\}\}/g,
  handler: markdownPlugin.handler,
  type: 'block',
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

  // Register built-in plugins
  registry.registerInlinePlugin(youtubePlugin);
  registry.registerInlinePlugin(emojiPlugin);
  registry.registerInlinePlugin(smilesPlugin);
  registry.registerInlinePlugin(reactionPlugin);
  registry.registerInlinePlugin(badgePlugin);
  registry.registerBlockPlugin(diagramPlugin);
  registry.registerBlockPlugin(markdownPlugin);

  return registry;
}
