#!/usr/bin/env node
/**
 * Build script for Cloudflare Worker
 * Bundles the worker code with all dependencies
 */

import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

try {
  await esbuild.build({
    entryPoints: ['src/cloudflare/worker.ts'],
    bundle: true,
    outfile: 'dist/worker.js',
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    sourcemap: false,
    conditions: ['worker', 'browser'],
    external: [],
    define: {
      'process.env.VERSION': JSON.stringify(pkg.version),
    },
    banner: {
      js: '// Cloudflare Worker - Markdown Parser API\n// Auto-generated - do not edit\n',
    },
    logLevel: 'info',
  });

  console.log('✅ Worker built successfully: dist/worker.js');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
