/**
 * Cloudflare Worker for Markdown Parser API
 *
 * Endpoints:
 * - POST /parse - Parse markdown to HTML
 * - POST /ast - Parse markdown to AST JSON
 * - GET /health - Health check
 * - GET / - API documentation
 */

import { Parser } from '../parser/parser';
import { HTMLRenderer } from '../renderer/html-renderer';

// CORS headers for cross-origin requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Response helpers
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html',
      ...CORS_HEADERS,
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse(
    {
      error: message,
      status,
    },
    status
  );
}

// Handle CORS preflight requests
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// API Documentation
function getApiDocs() {
  const docs = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Parser API</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2563eb; }
    h2 { color: #1e40af; margin-top: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h3 { color: #3b82f6; }
    code {
      background: #f3f4f6;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.9em;
    }
    pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }
    .endpoint {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 1rem;
      margin: 1rem 0;
    }
    .method {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-weight: bold;
      font-size: 0.85em;
    }
    .get { background: #10b981; color: white; }
    .post { background: #3b82f6; color: white; }
    .badge {
      display: inline-block;
      background: #06b6d4;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <h1>🚀 Markdown Parser API</h1>
  <p><span class="badge">v1.0.0</span> Advanced markdown parser with math, tables, footnotes, and more!</p>

  <h2>📋 Endpoints</h2>

  <div class="endpoint">
    <h3><span class="method post">POST</span> /parse</h3>
    <p>Parse markdown and return HTML</p>
    <h4>Request:</h4>
    <pre><code>{
  "markdown": "# Hello World\\n\\nThis is **bold**.",
  "options": {
    "enableMath": true,
    "enablePlugins": true
  }
}</code></pre>
    <h4>Response:</h4>
    <pre><code>{
  "html": "&lt;h1&gt;Hello World&lt;/h1&gt;\\n&lt;p&gt;This is &lt;strong&gt;bold&lt;/strong&gt;.&lt;/p&gt;",
  "processingTime": "2ms"
}</code></pre>
  </div>

  <div class="endpoint">
    <h3><span class="method post">POST</span> /ast</h3>
    <p>Parse markdown and return AST (Abstract Syntax Tree)</p>
    <h4>Request:</h4>
    <pre><code>{
  "markdown": "# Title\\n\\nParagraph text.",
  "options": {
    "enableMath": true,
    "enablePlugins": true
  }
}</code></pre>
    <h4>Response:</h4>
    <pre><code>{
  "ast": {
    "type": "document",
    "children": [...]
  },
  "processingTime": "1ms"
}</code></pre>
  </div>

  <div class="endpoint">
    <h3><span class="method get">GET</span> /health</h3>
    <p>Health check endpoint</p>
    <h4>Response:</h4>
    <pre><code>{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-11-06T..."
}</code></pre>
  </div>

  <h2>✨ Supported Features</h2>
  <ul>
    <li>✅ Standard Markdown (headings, paragraphs, emphasis, code, links, images)</li>
    <li>✅ Tables with alignment</li>
    <li>✅ Math formulas (inline $x^2$ and block $$\\frac{a}{b}$$)</li>
    <li>✅ Chemistry formulas with mhchem</li>
    <li>✅ Footnotes</li>
    <li>✅ Strikethrough, underline, highlight, superscript, subscript</li>
    <li>✅ Custom containers (:::note, ::highlight[]::)</li>
    <li>✅ Reference-style links</li>
    <li>✅ Auto-links</li>
    <li>✅ Complex nested lists</li>
    <li>✅ Block elements in lists</li>
  </ul>

  <h2>🔧 Options</h2>
  <ul>
    <li><code>enableMath</code> (boolean, default: true) - Enable math formula parsing</li>
    <li><code>enablePlugins</code> (boolean, default: true) - Enable plugin system (emoji, etc.)</li>
  </ul>

  <h2>📊 Example Usage</h2>
  <pre><code>// Using fetch
const response = await fetch('https://your-worker.workers.dev/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: '# Hello\\n\\nThis is $E=mc^2$ formula.',
    options: { enableMath: true }
  })
});

const { html } = await response.json();
console.log(html);</code></pre>

  <h2>⚡ Rate Limits</h2>
  <p>Currently no rate limits. For production use, consider implementing rate limiting.</p>

  <h2>📝 Limits</h2>
  <ul>
    <li>Maximum request size: 1MB</li>
    <li>Maximum markdown length: ~500KB</li>
  </ul>

  <footer style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; color: #6b7280;">
    <p>Powered by Cloudflare Workers | <a href="https://github.com/wangyu16/mdParserCF">GitHub</a></p>
  </footer>
</body>
</html>
  `;
  return htmlResponse(docs.trim());
}

// Health check endpoint
function handleHealth() {
  return jsonResponse({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: 'N/A (serverless)',
  });
}

// Parse markdown to HTML
async function handleParse(request: Request) {
  try {
    const body = (await request.json()) as any;

    if (!body.markdown) {
      return errorResponse('Missing "markdown" field in request body', 400);
    }

    const markdown = String(body.markdown);
    const options = body.options || {};

    // Validate markdown length
    if (markdown.length > 512000) {
      // ~500KB
      return errorResponse('Markdown content too large (max 500KB)', 413);
    }

    const startTime = Date.now();

    // Parse markdown
    const parser = new Parser(options);
    const ast = parser.parse(markdown);

    // Render to HTML
    const renderer = new HTMLRenderer();
    const html = renderer.render(ast);

    const processingTime = Date.now() - startTime;

    return jsonResponse({
      html,
      processingTime: `${processingTime}ms`,
      stats: {
        inputLength: markdown.length,
        outputLength: html.length,
      },
    });
  } catch (error: any) {
    console.error('Parse error:', error);
    return errorResponse(`Parsing failed: ${error.message || 'Unknown error'}`, 500);
  }
}

// Parse markdown to AST
async function handleAst(request: Request) {
  try {
    const body = (await request.json()) as any;

    if (!body.markdown) {
      return errorResponse('Missing "markdown" field in request body', 400);
    }

    const markdown = String(body.markdown);
    const options = body.options || {};

    // Validate markdown length
    if (markdown.length > 512000) {
      // ~500KB
      return errorResponse('Markdown content too large (max 500KB)', 413);
    }

    const startTime = Date.now();

    // Parse markdown to AST
    const parser = new Parser(options);
    const ast = parser.parse(markdown);

    const processingTime = Date.now() - startTime;

    return jsonResponse({
      ast,
      processingTime: `${processingTime}ms`,
      stats: {
        inputLength: markdown.length,
        nodeCount: countNodes(ast),
      },
    });
  } catch (error: any) {
    console.error('AST parse error:', error);
    return errorResponse(`AST parsing failed: ${error.message || 'Unknown error'}`, 500);
  }
}

// Helper: Count nodes in AST
function countNodes(node: any): number {
  let count = 1;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

// Main request handler
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Route requests
    if (path === '/' && request.method === 'GET') {
      return getApiDocs();
    }

    if (path === '/health' && request.method === 'GET') {
      return handleHealth();
    }

    if (path === '/parse' && request.method === 'POST') {
      return handleParse(request);
    }

    if (path === '/ast' && request.method === 'POST') {
      return handleAst(request);
    }

    // 404 Not Found
    return errorResponse(`Endpoint not found: ${path}`, 404);
  },
};
