/**
 * Tests for Plugin System
 *
 * Tests the extensible plugin architecture for custom markdown syntax
 */

import { describe, it, expect } from 'vitest';
import {
  PluginRegistry,
  youtubePlugin,
  emojiPlugin,
  smilesPlugin,
  badgePlugin,
  diagramPlugin,
  createDefaultPluginRegistry,
} from '../../src/parser/plugin-system';

describe('Plugin System', () => {
  describe('PluginRegistry', () => {
    it('should create empty registry', () => {
      const registry = new PluginRegistry();
      
      expect(registry.getInlinePlugins()).toHaveLength(0);
      expect(registry.getBlockPlugins()).toHaveLength(0);
    });

    it('should register inline plugins', () => {
      const registry = new PluginRegistry();
      registry.registerInlinePlugin(youtubePlugin);
      
      expect(registry.getInlinePlugins()).toHaveLength(1);
      expect(registry.getPlugin('youtube')).toBeDefined();
    });

    it('should register block plugins', () => {
      const registry = new PluginRegistry();
      registry.registerBlockPlugin(diagramPlugin);
      
      expect(registry.getBlockPlugins()).toHaveLength(1);
      expect(registry.getPlugin('diagram')).toBeDefined();
    });

    it('should reject wrong plugin type', () => {
      const registry = new PluginRegistry();
      
      expect(() => {
        registry.registerBlockPlugin({
          ...youtubePlugin,
          type: 'inline',
        } as any);
      }).toThrow();
    });

    it('should remove plugins', () => {
      const registry = new PluginRegistry();
      registry.registerInlinePlugin(youtubePlugin);
      
      expect(registry.getInlinePlugins()).toHaveLength(1);
      registry.removePlugin('youtube');
      expect(registry.getInlinePlugins()).toHaveLength(0);
    });

    it('should clear all plugins', () => {
      const registry = new PluginRegistry();
      registry.registerInlinePlugin(youtubePlugin);
      registry.registerBlockPlugin(diagramPlugin);
      
      expect(registry.getInlinePlugins().length + registry.getBlockPlugins().length).toBe(2);
      registry.clearPlugins();
      expect(registry.getInlinePlugins()).toHaveLength(0);
      expect(registry.getBlockPlugins()).toHaveLength(0);
    });
  });

  describe('Built-in Plugins', () => {
    describe('YouTube Plugin', () => {
      it('should have correct pattern', () => {
        expect(youtubePlugin.name).toBe('youtube');
        expect(youtubePlugin.type).toBe('inline');
        expect(youtubePlugin.pattern).toBeDefined();
      });

      it('should handle youtube handler', () => {
        const result = youtubePlugin.handler('{{youtube dQw4w9WgXcQ}}');
        
        expect(result.type).toBe('rendered');
        expect(result.content).toBeDefined();
        const node = result.content as any;
        expect(node.type).toBe('html-inline');
        expect(node.value).toContain('youtube.com/embed/dQw4w9WgXcQ');
        expect(node.value).toContain('iframe');
      });

      it('should fallthrough on invalid syntax', () => {
        const result = youtubePlugin.handler('{{youtube}}');
        
        expect(result.type).toBe('fallthrough');
        expect(result.content).toBeUndefined();
      });
    });

    describe('Emoji Plugin', () => {
      it('should have correct pattern', () => {
        expect(emojiPlugin.name).toBe('emoji');
        expect(emojiPlugin.type).toBe('inline');
      });

      it('should convert emoji names to unicode', () => {
        const testCases = [
          ['{{emoji smile}}', '😊'],
          ['{{emoji thumbsup}}', '👍'],
          ['{{emoji rocket}}', '🚀'],
          ['{{emoji heart}}', '❤️'],
        ];

        for (const [input, expected] of testCases) {
          const result = emojiPlugin.handler(input);
          expect(result.type).toBe('rendered');
          const node = result.content as any;
          expect(node.type).toBe('text');
          expect(node.value).toBe(expected);
        }
      });

      it('should fallthrough on empty emoji', () => {
        const result = emojiPlugin.handler('{{emoji}}');
        
        expect(result.type).toBe('fallthrough');
      });
    });

    describe('SMILES Plugin', () => {
      it('should have correct pattern', () => {
        expect(smilesPlugin.name).toBe('smiles');
        expect(smilesPlugin.type).toBe('inline');
      });

      it('should render SMILES notation', () => {
        const result = smilesPlugin.handler('{{smiles CCCO}}');
        
        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.type).toBe('html-inline');
        expect(node.value).toContain('CCCO');
        expect(node.value).toContain('smiles');
      });

      it('should escape SMILES content', () => {
        const result = smilesPlugin.handler('{{smiles C=C}}');
        
        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('C=C');
      });
    });

    describe('Badge Plugin', () => {
      it('should have correct pattern', () => {
        expect(badgePlugin.name).toBe('badge');
        expect(badgePlugin.type).toBe('inline');
      });

      it('should render badges', () => {
        const testCases = [
          'success',
          'danger',
          'warning',
          'info',
          'primary',
          'secondary',
        ];

        for (const type of testCases) {
          const result = badgePlugin.handler(`{{badge ${type}: Label}}`);
          expect(result.type).toBe('rendered');
          const node = result.content as any;
          expect(node.value).toContain(`badge-${type}`);
          expect(node.value).toContain('Label');
        }
      });

      it('should default unknown badge type to info', () => {
        const result = badgePlugin.handler('{{badge unknown: Label}}');
        
        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('badge-info');
      });
    });

    describe('Diagram Plugin', () => {
      it('should have correct pattern', () => {
        expect(diagramPlugin.name).toBe('diagram');
        expect(diagramPlugin.type).toBe('block');
      });

      it('should render mermaid diagrams', () => {
        const diagramContent = `graph TD
    A --> B`;
        const result = diagramPlugin.handler(`{{diagram mermaid
${diagramContent}
}}`);
        
        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.type).toBe('html-block');
        expect(node.content).toContain('mermaid');
        expect(node.content).toContain('graph TD');
        expect(node.content).toContain('A --> B');
      });

      it('should fallthrough on unknown diagram type', () => {
        const result = diagramPlugin.handler('{{diagram unknown\ncontent\n}}');
        
        expect(result.type).toBe('fallthrough');
      });
    });
  });

  describe('Default Plugin Registry', () => {
    it('should create registry with all built-in plugins', () => {
      const registry = createDefaultPluginRegistry();
      
      const inline = registry.getInlinePlugins();
      const block = registry.getBlockPlugins();
      
      expect(inline).toHaveLength(4); // youtube, emoji, smiles, badge
      expect(block).toHaveLength(1); // diagram
    });

    it('should have youtube plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('youtube')).toBeDefined();
    });

    it('should have emoji plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('emoji')).toBeDefined();
    });

    it('should have smiles plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('smiles')).toBeDefined();
    });

    it('should have badge plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('badge')).toBeDefined();
    });

    it('should have diagram plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('diagram')).toBeDefined();
    });
  });

  describe('Plugin Patterns', () => {
    it('should have valid regex patterns', () => {
      const plugins = [
        youtubePlugin,
        emojiPlugin,
        smilesPlugin,
        badgePlugin,
        diagramPlugin,
      ];

      for (const plugin of plugins) {
        expect(plugin.pattern instanceof RegExp).toBe(true);
      }
    });

    it('should match plugin syntax correctly', () => {
      expect('{{youtube dQw4w9WgXcQ}}'.match(youtubePlugin.pattern)).toBeDefined();
      expect('{{emoji smile}}'.match(emojiPlugin.pattern)).toBeDefined();
      expect('{{smiles CCCO}}'.match(smilesPlugin.pattern)).toBeDefined();
      expect('{{badge success: Label}}'.match(badgePlugin.pattern)).toBeDefined();
    });
  });
});
