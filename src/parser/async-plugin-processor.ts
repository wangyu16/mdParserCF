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
 * @returns Promise<string> - HTML with placeholders replaced by actual content
 */
export async function processAsyncPlugins(html: string): Promise<string> {
  // Find all async plugin placeholders
  const placeholderRegex =
    /<div[^>]*class="async-plugin-placeholder"[^>]*data-plugin="([^"]+)"[^>]*data-qrcode-text="([^"]+)"[^>]*data-api-url="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;

  const placeholders: Array<{
    fullMatch: string;
    plugin: string;
    text: string;
    apiUrl: string;
    id: string;
  }> = [];

  let match;
  while ((match = placeholderRegex.exec(html)) !== null) {
    // Extract ID from the full match
    const idMatch = match[0].match(/id="([^"]+)"/);
    placeholders.push({
      fullMatch: match[0],
      plugin: match[1],
      text: unescapeHtml(match[2]),
      apiUrl: unescapeHtml(match[3]),
      id: idMatch ? idMatch[1] : '',
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
      if (placeholder.plugin === 'qrcode') {
        const replacement = await processQRCodePlugin(
          placeholder.id,
          placeholder.text,
          placeholder.apiUrl
        );
        processedHtml = processedHtml.replace(placeholder.fullMatch, replacement);
      }
      // Add more async plugin types here as needed
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
 * Process QR code plugin - fetches QR code from API
 */
async function processQRCodePlugin(id: string, text: string, apiUrl: string): Promise<string> {
  try {
    // Verify the API endpoint is accessible using GET (HEAD not supported)
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'mdParserCF/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    // Generate final HTML with the QR code image
    const html = `<div id="${id}" class="qrcode-container" data-qrcode-text="${escapeHtml(text)}" style="margin: 1em 0; text-align: center;">
<img src="${apiUrl}" alt="QR Code: ${escapeHtml(text)}" style="max-width: 300px; height: auto; border: 1px solid #ddd; padding: 10px; background: white;" loading="lazy" crossorigin="anonymous" referrerpolicy="no-referrer" />
<p style="font-size: 0.85em; color: #666; margin-top: 0.5em;">${escapeHtml(text)}</p>
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
