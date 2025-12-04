/**
 * Async Plugin Processor
 *
 * Handles post-processing of async plugins by:
 * 1. Finding placeholders in HTML
 * 2. Processing async plugin handlers
 * 3. Replacing placeholders with actual content
 */

/**
 * Process async plugin placeholders in rendered HTML
 *
 * @param html - The HTML string with async plugin placeholders
 * @param workerOrigin - Optional origin URL of the worker (for same-origin fetch workaround)
 * @returns Promise<string> - HTML with placeholders replaced by actual content
 */
export async function processAsyncPlugins(html: string, workerOrigin?: string): Promise<string> {
  // Find all async plugin placeholders
  const placeholderRegex =
    /<div[^>]*class="async-plugin-placeholder"[^>]*data-plugin="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;

  const placeholders: Array<{
    fullMatch: string;
    plugin: string;
    id: string;
    data: Record<string, string>;
  }> = [];

  let match;
  while ((match = placeholderRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const plugin = match[1];
    const idMatch = fullMatch.match(/id="([^"]+)"/);

    // Extract all data attributes
    const data: Record<string, string> = {};
    const dataAttrRegex = /data-([a-z-]+)="([^"]*)"/g;
    let dataMatch;
    while ((dataMatch = dataAttrRegex.exec(fullMatch)) !== null) {
      data[dataMatch[1]] = unescapeHtml(dataMatch[2]);
    }

    placeholders.push({
      fullMatch,
      plugin,
      id: idMatch ? idMatch[1] : '',
      data,
    });
  }

  if (placeholders.length === 0) {
    return html; // No async plugins to process
  }

  console.log(`🔄 Processing ${placeholders.length} async plugin(s)...`);

  // Process each placeholder
  let processedHtml = html;

  for (const placeholder of placeholders) {
    try {
      let replacement: string;

      if (placeholder.plugin === 'qrcode') {
        replacement = await processQRCodePlugin(
          placeholder.id,
          placeholder.data['qrcode-text'],
          placeholder.data['api-url']
        );
      } else if (placeholder.plugin === 'markdown') {
        replacement = await processMarkdownPlugin(
          placeholder.id,
          placeholder.data['markdown-url'],
          workerOrigin
        );
      } else {
        console.warn(`⚠️ Unknown async plugin: ${placeholder.plugin}`);
        continue;
      }

      processedHtml = processedHtml.replace(placeholder.fullMatch, replacement);
    } catch (error: any) {
      console.error(`❌ Error processing ${placeholder.plugin}:`, error.message);
      // Replace with error message
      const errorHtml = `<div id="${placeholder.id}" class="async-plugin-error" style="margin: 1em 0; padding: 1em; border: 1px solid #f44336; background: #ffebee; color: #c62828; border-radius: 4px;">
<strong>Error loading ${placeholder.plugin}:</strong> ${escapeHtml(error.message)}
</div>`;
      processedHtml = processedHtml.replace(placeholder.fullMatch, errorHtml);
    }
  }

  return processedHtml;
}

/**
 * Process markdown plugin - fetches and renders external markdown
 */
async function processMarkdownPlugin(
  id: string,
  url: string,
  _workerOrigin?: string
): Promise<string> {
  try {
    // Create a new Request object to ensure proper URL handling
    // This is important for worker-to-worker requests on Cloudflare
    const request = new Request(url, {
      method: 'GET',
      headers: {
        Accept: 'text/plain, text/markdown, */*',
      },
    });

    // Fetch the markdown content
    const response = await fetch(request);

    if (!response.ok) {
      throw new Error(`Failed to fetch markdown: HTTP ${response.status}`);
    }

    const markdownText = await response.text();

    // Limit content size (100KB)
    if (markdownText.length > 100000) {
      throw new Error('Content too large (max 100KB)');
    }

    // Parse the markdown (import dynamically to avoid circular deps)
    const { Parser } = await import('./parser');
    const { HTMLRenderer } = await import('../renderer/html-renderer');

    const parser = new Parser({
      debugAST: false,
      enablePlugins: false, // Disable plugins to prevent infinite recursion
    });
    const ast = parser.parse(markdownText);
    const renderer = new HTMLRenderer();
    const renderedHtml = renderer.render(ast).html;

    // Generate final HTML without styling - just return the rendered content
    const html = `<div id="${id}" class="markdown-embed">
${renderedHtml}
</div>`;

    return html;
  } catch (error: any) {
    throw new Error(`Failed to process markdown: ${error.message}`);
  }
}

/**
 * Process QR code plugin - fetches QR code from API
 */
async function processQRCodePlugin(id: string, text: string, apiUrl: string): Promise<string> {
  try {
    // Fetch the QR code from the API (format=raw returns the URL as plain text)
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'mdParserCF/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    // Get the image URL from the response (plain text with format=raw)
    const imageUrl = (await response.text()).trim();

    if (!imageUrl) {
      throw new Error('API returned empty URL');
    }

    // Generate final HTML with the QR code image - clean output without styling
    const html = `<div id="${id}" class="qrcode-container" data-qrcode-text="${escapeHtml(text)}">
<img src="${escapeHtml(imageUrl)}" alt="QR Code" loading="lazy" />
</div>`;

    return html;
  } catch (error: any) {
    throw new Error(`Failed to fetch QR code: ${error.message}`);
  }
}

// Helper functions
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

function unescapeHtml(text: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return text.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => htmlUnescapes[entity]);
}
