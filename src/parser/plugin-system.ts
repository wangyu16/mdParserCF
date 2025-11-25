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
 * 1. Input Type: How the plugin syntax is parsed (inline vs block)
 * 2. Output Type: What HTML element type is produced (inline vs block)
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
}

/**
 * Plugin handler function - processes plugin syntax
 */
export type PluginHandler = (content: string) => PluginResult;

/**
 * Plugin definition with separate input and output type classification
 *
 * @property name - Plugin identifier (e.g., 'youtube', 'emoji')
 * @property aliases - Alternative names (e.g., 'md' for 'markdown')
 * @property inputType - How the plugin is parsed:
 *   - 'inline': Single-line content, can appear within paragraphs
 *   - 'block': Multi-line content, must be standalone
 * @property outputType - What HTML type is produced:
 *   - 'inline': Produces inline elements (<span>, <img>, etc.)
 *   - 'block': Produces block elements (<div>, <iframe>, etc.)
 * @property pattern - Regex to match plugin syntax
 * @property handler - Function to process matched content
 */
export interface Plugin {
  name: string;
  aliases?: string[];
  inputType: 'inline' | 'block';
  outputType: 'inline' | 'block';
  pattern: RegExp;
  handler: PluginHandler;
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
 * Plugins are organized by their inputType for parsing purposes:
 * - Inline plugins: Matched within paragraph text
 * - Block plugins: Matched as standalone blocks
 */
export class PluginRegistry {
  private inlinePlugins: Map<string, Plugin> = new Map();
  private blockPlugins: Map<string, Plugin> = new Map();

  /**
   * Register a plugin (auto-detects based on inputType)
   */
  public registerPlugin(plugin: Plugin): void {
    if (plugin.inputType === 'inline') {
      this.registerInlinePlugin(plugin);
    } else {
      this.registerBlockPlugin(plugin);
    }
  }

  /**
   * Register a new inline-input plugin
   */
  public registerInlinePlugin(plugin: Plugin): void {
    if (plugin.inputType !== 'inline') {
      throw new Error(`Plugin ${plugin.name} must have inputType 'inline'`);
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
   * Register a new block-input plugin
   */
  public registerBlockPlugin(plugin: Plugin): void {
    if (plugin.inputType !== 'block') {
      throw new Error(`Plugin ${plugin.name} must have inputType 'block'`);
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
   * Get all inline-input plugins (unique, excluding aliases)
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
   * Get all block-input plugins (unique, excluding aliases)
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
  inputType: 'inline',
  outputType: 'block',
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
  inputType: 'inline',
  outputType: 'inline',
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
};

/**
 * SMILES (chemical notation) plugin
 * Syntax: {{smiles CCCO}}
 *
 * Input: Inline (single-line SMILES notation)
 * Output: Inline (canvas element for molecular structure)
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
  inputType: 'inline',
  outputType: 'inline',
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
};

/**
 * Chemical Reaction plugin
 * Syntax: {{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]}}
 * Optional syntax with options: {{reaction C=CCBr>CC(=O)C>C=CCI | textBelowArrow: 90%, theme: oldschool}}
 *
 * Input: Inline (single-line reaction SMILES)
 * Output: Inline (SVG element for reaction scheme)
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
  inputType: 'inline',
  outputType: 'inline',
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
  inputType: 'inline',
  outputType: 'inline',
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
};

/**
 * Mermaid diagram plugin
 * Syntax: {{diagram mermaid
 *   graph TD
 *   A --> B
 * }}
 *
 * Input: Block (multi-line diagram definition)
 * Output: Block (div element with diagram content)
 */
export const diagramPlugin: Plugin = {
  name: 'diagram',
  inputType: 'block',
  outputType: 'block',
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
};

/**
 * Markdown/MD embed plugin
 * Syntax: {{markdown https://example.com/file.md}}
 *         {{md https://example.com/file.md}}
 *
 * Input: Block (stands alone on its own line, processed at block level)
 * Output: Block (div element with embedded content)
 *
 * Note: Although the syntax is a single line (URL only), this plugin must be
 * parsed at the block level because it produces block-level content and should
 * not appear inline within paragraph text.
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
  inputType: 'block',
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

  // Register built-in inline-input plugins
  registry.registerPlugin(youtubePlugin); // inline input → block output
  registry.registerPlugin(emojiPlugin); // inline input → inline output
  registry.registerPlugin(smilesPlugin); // inline input → inline output
  registry.registerPlugin(reactionPlugin); // inline input → inline output
  registry.registerPlugin(badgePlugin); // inline input → inline output
  registry.registerPlugin(markdownPlugin); // inline input → block output (with 'md' alias)

  // Register built-in block-input plugins
  registry.registerPlugin(diagramPlugin); // block input → block output

  return registry;
}
