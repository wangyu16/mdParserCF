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
  qrcodePlugin,
  badgePlugin,
  mermaidPlugin,
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
      registry.registerInlinePlugin(emojiPlugin);

      expect(registry.getInlinePlugins()).toHaveLength(1);
      expect(registry.getPlugin('emoji')).toBeDefined();
    });

    it('should register block plugins', () => {
      const registry = new PluginRegistry();
      registry.registerBlockPlugin(mermaidPlugin);

      expect(registry.getBlockPlugins()).toHaveLength(1);
      expect(registry.getPlugin('mermaid')).toBeDefined();
    });

    it('should reject inline/inline plugin registered as block', () => {
      const registry = new PluginRegistry();

      expect(() => {
        registry.registerBlockPlugin({
          ...emojiPlugin, // emoji is inline/inline
        } as any);
      }).toThrow();
    });

    it('should remove plugins', () => {
      const registry = new PluginRegistry();
      registry.registerInlinePlugin(emojiPlugin);

      expect(registry.getInlinePlugins()).toHaveLength(1);
      registry.removePlugin('emoji');
      expect(registry.getInlinePlugins()).toHaveLength(0);
    });

    it('should clear all plugins', () => {
      const registry = new PluginRegistry();
      registry.registerInlinePlugin(emojiPlugin);
      registry.registerBlockPlugin(mermaidPlugin);

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
        expect(youtubePlugin.inputType).toBe('inline');
        expect(youtubePlugin.outputType).toBe('block');
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
        expect(emojiPlugin.inputType).toBe('inline');
        expect(emojiPlugin.outputType).toBe('inline');
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
        expect(smilesPlugin.inputType).toBe('inline');
        expect(smilesPlugin.outputType).toBe('block');
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

    describe('QR Code Plugin', () => {
      it('should have correct pattern', () => {
        expect(qrcodePlugin.name).toBe('qrcode');
        expect(qrcodePlugin.inputType).toBe('inline');
        expect(qrcodePlugin.outputType).toBe('block');
      });

      it('should render QR code with URL', () => {
        const result = qrcodePlugin.handler('{{qrcode https://example.com}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.type).toBe('html-block');
        // Now returns placeholder with async-plugin-placeholder class
        expect(node.content).toContain('async-plugin-placeholder');
        expect(node.content).toContain('data-plugin="qrcode"');
        expect(node.content).toContain('https://example.com');
        expect(node.content).toContain('yw-qrcode.deno.dev');
      });

      it('should render QR code with text', () => {
        const result = qrcodePlugin.handler('{{qr Hello World}}');

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.content).toContain('Hello World');
        // Now returns placeholder with async-plugin-placeholder class
        expect(node.content).toContain('async-plugin-placeholder');
        expect(node.content).toContain('data-plugin="qrcode"');
      });

      it('should generate unique IDs', () => {
        const result1 = qrcodePlugin.handler('{{qrcode Test1}}');
        const result2 = qrcodePlugin.handler('{{qrcode Test2}}');

        const node1 = result1.content as any;
        const node2 = result2.content as any;

        const id1Match = node1.content.match(/id="(qr-\w+)"/);
        const id2Match = node2.content.match(/id="(qr-\w+)"/);

        expect(id1Match).toBeTruthy();
        expect(id2Match).toBeTruthy();
        if (id1Match && id2Match) {
          expect(id1Match[1]).not.toBe(id2Match[1]);
        }
      });

      it('should fallthrough on empty content', () => {
        const result = qrcodePlugin.handler('{{qrcode}}');
        expect(result.type).toBe('fallthrough');
      });

      it('should include async metadata', () => {
        const result = qrcodePlugin.handler('{{qrcode Test}}');
        expect(result.type).toBe('rendered');
        expect(result.asyncData).toBeDefined();
        expect(result.asyncData?.text).toBe('Test');
        expect(result.asyncData?.apiUrl).toContain('yw-qrcode.deno.dev');
      });
    });

    describe('Badge Plugin', () => {
      it('should have correct pattern', () => {
        expect(badgePlugin.name).toBe('badge');
        expect(badgePlugin.inputType).toBe('inline');
        expect(badgePlugin.outputType).toBe('inline');
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

    describe('Mermaid Plugin', () => {
      it('should have correct pattern', () => {
        expect(mermaidPlugin.name).toBe('mermaid');
        expect(mermaidPlugin.inputType).toBe('block');
        expect(mermaidPlugin.outputType).toBe('block');
      });

      it('should render mermaid diagrams', () => {
        const diagramContent = `graph TD
    A --> B`;
        const result = mermaidPlugin.handler(`{{mermaid
${diagramContent}
}}`);

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.type).toBe('html-block');
        expect(node.content).toContain('mermaid');
        expect(node.content).toContain('graph TD');
        expect(node.content).toContain('A --> B');
      });

      it('should work with mm alias', () => {
        const result = mermaidPlugin.handler(`{{mm
graph LR
    Start --> End
}}`);

        expect(result.type).toBe('rendered');
        const node = result.content as any;
        expect(node.content).toContain('graph LR');
      });

      it('should fallthrough on empty content', () => {
        const result = mermaidPlugin.handler('{{mermaid\n}}');

        expect(result.type).toBe('fallthrough');
      });
    });
  });

  describe('Default Plugin Registry', () => {
    it('should create registry with all built-in plugins', () => {
      const registry = createDefaultPluginRegistry();

      const inline = registry.getInlinePlugins();
      const block = registry.getBlockPlugins();

      expect(inline).toHaveLength(2); // emoji, badge (both inline/inline)
      expect(block).toHaveLength(5); // youtube, smiles, qrcode, markdown, mermaid (any block)
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

    it('should have qrcode plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('qrcode')).toBeDefined();
    });

    it('should have badge plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('badge')).toBeDefined();
    });

    it('should have mermaid plugin', () => {
      const registry = createDefaultPluginRegistry();
      expect(registry.getPlugin('mermaid')).toBeDefined();
    });
  });

  describe('Plugin Patterns', () => {
    it('should have valid regex patterns', () => {
      const plugins = [
        youtubePlugin,
        emojiPlugin,
        smilesPlugin,
        qrcodePlugin,
        badgePlugin,
        mermaidPlugin,
      ];

      for (const plugin of plugins) {
        expect(plugin.pattern instanceof RegExp).toBe(true);
      }
    });

    it('should match plugin syntax correctly', () => {
      expect('{{youtube dQw4w9WgXcQ}}'.match(youtubePlugin.pattern)).toBeDefined();
      expect('{{emoji smile}}'.match(emojiPlugin.pattern)).toBeDefined();
      expect('{{smiles CCCO}}'.match(smilesPlugin.pattern)).toBeDefined();
      expect('{{qrcode Hello}}'.match(qrcodePlugin.pattern)).toBeDefined();
      expect('{{badge success: Label}}'.match(badgePlugin.pattern)).toBeDefined();
    });
  });

  describe('Async Plugin Processing', () => {
    it('should process QR code placeholders asynchronously', async () => {
      const { processAsyncPlugins } = await import('../../src/parser/async-plugin-processor');

      const html = `<div id="qr-test123" class="async-plugin-placeholder" data-plugin="qrcode" data-qrcode-text="Hello" data-api-url="https://yw-qrcode.deno.dev/api/generate?text=Hello&format=raw" style="margin: 1em 0; text-align: center;">
<div style="padding: 20px; border: 1px solid #ddd; background: #f5f5f5;">Loading QR code...</div>
</div>`;

      const processed = await processAsyncPlugins(html);

      // Should replace placeholder with actual QR code
      expect(processed).toContain('qrcode-container');
      expect(processed).toContain('img src="https://yw-qrcode.deno.dev/');
      expect(processed).toContain('Hello');
      expect(processed).not.toContain('Loading QR code...');
    });

    it('should handle multiple QR codes', async () => {
      const { processAsyncPlugins } = await import('../../src/parser/async-plugin-processor');

      const html = `<div class="async-plugin-placeholder" data-plugin="qrcode" data-qrcode-text="Test1" data-api-url="https://yw-qrcode.deno.dev/api/generate?text=Test1&format=raw">Loading...</div>
<div class="async-plugin-placeholder" data-plugin="qrcode" data-qrcode-text="Test2" data-api-url="https://yw-qrcode.deno.dev/api/generate?text=Test2&format=raw">Loading...</div>`;

      const processed = await processAsyncPlugins(html);

      expect(processed).toContain('Test1');
      expect(processed).toContain('Test2');
      const qrCodeMatches = processed.match(/qrcode-container/g);
      expect(qrCodeMatches).toBeDefined();
      expect(qrCodeMatches?.length).toBe(2);
    });

    it('should return unchanged HTML when no async plugins present', async () => {
      const { processAsyncPlugins } = await import('../../src/parser/async-plugin-processor');

      const html = '<p>Hello World</p>';
      const processed = await processAsyncPlugins(html);

      expect(processed).toBe(html);
    });
  });
});
