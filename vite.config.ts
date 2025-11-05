import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    target: 'es2020',
    lib: {
      entry: `${__dirname}/src/index.ts`,
      name: 'MDParserCF',
      fileName: (format: string): string => {
        if (format === 'es') return 'index.esm.js';
        return 'index.umd.js';
      },
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: 'index.esm.js',
          dir: 'dist',
        },
        {
          format: 'umd',
          name: 'MDParserCF',
          entryFileNames: 'index.umd.js',
          dir: 'dist',
        },
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': `${__dirname}/src`,
      '@parser': `${__dirname}/src/parser`,
      '@renderer': `${__dirname}/src/renderer`,
      '@plugins': `${__dirname}/src/plugins`,
      '@extensions': `${__dirname}/src/extensions`,
      '@utils': `${__dirname}/src/utils`,
    },
  },
});
