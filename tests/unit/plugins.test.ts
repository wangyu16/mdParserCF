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
  reactionPlugin,
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

      it('should render SMILES notation with canvas placeholder', () => {
        const result = smilesPlugin.handler('{{smiles CCCO}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.type).toBe('html-inline');
        expect(node.value).toContain('CCCO');

        // Should contain canvas element for client-side rendering
        expect(node.value).toContain('canvas');
        expect(node.value).toContain('data-smiles');
        expect(node.value).toContain('SmilesDrawer');
      });

      it('should handle simple ethanol SMILES', () => {
        const result = smilesPlugin.handler('{{smiles CCO}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('CCO');
        expect(node.value).toContain('canvas');
      });

      it('should handle benzene ring SMILES', () => {
        const result = smilesPlugin.handler('{{smiles c1ccccc1}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('c1ccccc1');
        expect(node.value).toContain('canvas');
      });

      it('should handle double bonds in SMILES', () => {
        const result = smilesPlugin.handler('{{smiles C=C}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('C=C');
        expect(node.value).toContain('canvas');
      });

      it('should handle brackets in SMILES', () => {
        const result = smilesPlugin.handler('{{smiles CC[CH3]}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('CC[CH3]');
        expect(node.value).toContain('canvas');
      });

      it('should handle cyclohexane SMILES', () => {
        const result = smilesPlugin.handler('{{smiles C1CCCCC1}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('C1CCCCC1');
        expect(node.value).toContain('canvas');
      });

      it('should fallthrough on missing SMILES content', () => {
        const result = smilesPlugin.handler('{{smiles}}');

        expect(result.type).toBe('fallthrough');
      });

      it('should generate unique canvas IDs', () => {
        const result1 = smilesPlugin.handler('{{smiles CCO}}');
        const result2 = smilesPlugin.handler('{{smiles C=C}}');

        const node1 = result1.content as any;
        const node2 = result2.content as any;

        // Extract canvas IDs
        const id1Match = node1.value.match(/id="(smiles-\w+)"/);
        const id2Match = node2.value.match(/id="(smiles-\w+)"/);

        expect(id1Match).toBeTruthy();
        expect(id2Match).toBeTruthy();
        if (id1Match && id2Match) {
          expect(id1Match[1]).not.toBe(id2Match[1]);
        }
      });
    });

    describe('Reaction Plugin', () => {
      it('should have correct pattern', () => {
        expect(reactionPlugin.name).toBe('reaction');
        expect(reactionPlugin.type).toBe('inline');
      });

      it('should render simple reaction', () => {
        const result = reactionPlugin.handler(
          '{{reaction C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]}}'
        );

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('C=CCBr.[Na+].[I-]>CC(=O)C>C=CCI.[Na+].[Br-]');
        expect(node.value).toContain('svg');
        expect(node.value).toContain('data-smiles');
        // SMILES string should not be displayed in the output
        expect(node.value).not.toContain('<code>');
      });

      it('should render reaction with textBelowArrow option', () => {
        const result = reactionPlugin.handler(
          '{{reaction C=CCBr>CC(=O)C>C=CCI | textBelowArrow: 90%}}'
        );

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('C=CCBr>CC(=O)C>C=CCI');
        expect(node.value).toContain('data-smiles-options');
        expect(node.value).toContain('textBelowArrow');
        expect(node.value).toContain('90%');
      });

      it('should render reaction with theme option', () => {
        const result = reactionPlugin.handler('{{reaction CCCO>CrO3>CCC(=O)O | theme: oldschool}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('CCCO>CrO3>CCC(=O)O');
        expect(node.value).toContain('data-smiles-options');
        expect(node.value).toContain('theme');
        expect(node.value).toContain('oldschool');
      });

      it('should render reaction with multiple options', () => {
        const result = reactionPlugin.handler(
          '{{reaction C=CCBr>CC(=O)C>C=CCI | theme: oldschool, textBelowArrow: 90%}}'
        );

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('data-smiles-options');
        expect(node.value).toContain('theme');
        expect(node.value).toContain('oldschool');
        expect(node.value).toContain('textBelowArrow');
        expect(node.value).toContain('90%');
      });

      it('should handle esterification reaction', () => {
        const result = reactionPlugin.handler(
          '{{reaction CC(=O)O.CCO>H2SO4>CC(=O)OCC.O | textBelowArrow: Heat}}'
        );

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.value).toContain('CC(=O)O.CCO>H2SO4>CC(=O)OCC.O');
        expect(node.value).toContain('textBelowArrow');
        expect(node.value).toContain('Heat');
      });

      it('should fallthrough on missing reaction content', () => {
        const result = reactionPlugin.handler('{{reaction}}');

        expect(result.type).toBe('fallthrough');
      });

      it('should not display SMILES string in output', () => {
        const result1 = reactionPlugin.handler('{{reaction C=CCBr>CC(=O)C>C=CCI}}');
        const result2 = reactionPlugin.handler('{{reaction CCCO>CrO3>CCC(=O)O}}');

        const node1 = result1.content as any;
        const node2 = result2.content as any;

        // SMILES strings should be in data-smiles attributes but not visible as text
        expect(node1.value).toContain('data-smiles="C=CCBr>CC(=O)C>C=CCI"');
        expect(node1.value).not.toContain('<p style="font-size: 0.85em');
        expect(node1.value).not.toContain('<code>C=CCBr>CC(=O)C>C=CCI</code>');

        expect(node2.value).toContain('data-smiles="CCCO>CrO3>CCC(=O)O"');
        expect(node2.value).not.toContain('<p style="font-size: 0.85em');
        expect(node2.value).not.toContain('<code>CCCO>CrO3>CCC(=O)O</code>');
      });
    });

    describe('Badge Plugin', () => {
      it('should have correct pattern', () => {
        expect(badgePlugin.name).toBe('badge');
        expect(badgePlugin.type).toBe('inline');
      });

      it('should render badges', () => {
        const testCases = ['success', 'danger', 'warning', 'info', 'primary', 'secondary'];

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

      expect(inline).toHaveLength(5); // youtube, emoji, smiles, reaction, badge
      expect(block).toHaveLength(2); // diagram, markdown
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

    it('should have reaction plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('reaction')).toBeDefined();
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
        reactionPlugin,
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
      expect('{{reaction C=CCBr>CC(=O)C>C=CCI}}'.match(reactionPlugin.pattern)).toBeDefined();
      expect('{{badge success: Label}}'.match(badgePlugin.pattern)).toBeDefined();
    });
  });
});
