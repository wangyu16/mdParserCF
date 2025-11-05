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

// Import SmilesDrawer for chemical structure rendering
// Using dynamic import with any type for compatibility
let SmilesDrawer: any;
try {
  SmilesDrawer = require('smiles-drawer');
} catch (e) {
  // SmilesDrawer not available in some environments
  SmilesDrawer = null;
}

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
<p style="font-size: 0.85em; color: #666; margin: 0.5em 0;">
  <code>${smilesString}</code>
</p>
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
 * Create default plugin registry with built-in plugins
 */
export function createDefaultPluginRegistry(): PluginRegistry {
  const registry = new PluginRegistry();

  // Register built-in plugins
  registry.registerInlinePlugin(youtubePlugin);
  registry.registerInlinePlugin(emojiPlugin);
  registry.registerInlinePlugin(smilesPlugin);
  registry.registerInlinePlugin(badgePlugin);
  registry.registerBlockPlugin(diagramPlugin);

  return registry;
}
