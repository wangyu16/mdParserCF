# Cloudflare Worker Deployment Guide

## 🚀 Quick Start

Your Markdown Parser is now ready to deploy as a Cloudflare Worker API!

### TL;DR - Deploy Now

```bash
# 1. Create API token at: https://dash.cloudflare.com/profile/api-tokens
#    Template: "Edit Cloudflare Workers"

# 2. Set token
export CLOUDFLARE_API_TOKEN="your-token-here"

# 3. Get account ID
npx wrangler whoami

# 4. Update wrangler.toml with your account_id

# 5. Deploy!
npm run deploy
```

### Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com/sign-up
2. **Wrangler CLI**: Already installed in this project
3. **Node.js**: v22+ (already set up)

## 📋 Deployment Steps

### Step 1: Authenticate with Cloudflare

You have two options for authentication:

#### Option A: Interactive Login (Easier)

```bash
npx wrangler login
```

This will open a browser window for authentication.

#### Option B: API Token (Recommended for CI/CD)

1. **Create an API Token** at: https://dash.cloudflare.com/profile/api-tokens

2. **Choose Template**: Click "Create Token" → Use the **"Edit Cloudflare Workers"** template

3. **Required Permissions**:
   - Account → Workers Scripts → Edit
   - Account → Account Settings → Read
   - Zone → Workers Routes → Edit (if using custom domains)

4. **Create and Copy Token**: Save it securely!

5. **Set Environment Variable**:

   ```bash
   export CLOUDFLARE_API_TOKEN="your-api-token-here"
   ```

   Or add to `~/.bashrc` or `~/.zshrc`:

   ```bash
   echo 'export CLOUDFLARE_API_TOKEN="your-api-token-here"' >> ~/.bashrc
   source ~/.bashrc
   ```

6. **Verify**:
   ```bash
   npx wrangler whoami
   ```

**For CI/CD pipelines** (GitHub Actions, GitLab CI, etc.):

- Add `CLOUDFLARE_API_TOKEN` as a secret in your CI/CD platform
- Wrangler will automatically use it from environment variables

### Step 2: Get Your Account ID

After logging in, get your account ID:

```bash
npx wrangler whoami
```

Or find it in the Cloudflare dashboard: https://dash.cloudflare.com/ → Select your domain → Overview (right sidebar)

### Step 3: Update wrangler.toml

Edit `wrangler.toml` and add your account ID:

```toml
# Uncomment and add your account ID
account_id = "your-account-id-here"
```

### Step 4: Deploy to Production

```bash
npm run deploy
```

This will:

1. Build the worker bundle (`npm run build:worker`)
2. Deploy to Cloudflare Workers

### Step 5: Test Your Deployment

Your worker will be available at:

```
https://mdparser-cf.your-subdomain.workers.dev
```

Test it:

```bash
curl https://mdparser-cf.your-subdomain.workers.dev/health
```

## 🌍 Custom Domain (Optional)

### Option A: Use workers.dev Subdomain

By default, your worker is available at `*.workers.dev`. No configuration needed!

### Option B: Use Your Own Domain

1. Add your domain to Cloudflare
2. In `wrangler.toml`, uncomment and update:
   ```toml
   [env.production]
   route = "api.yourdomain.com/*"
   zone_id = "your-zone-id"
   ```
3. Deploy again: `npm run deploy`

## 📊 API Endpoints

Once deployed, your API will have these endpoints:

### GET /

API documentation (interactive HTML page)

### GET /health

Health check

```bash
curl https://your-worker.workers.dev/health
```

### POST /parse

Parse markdown to HTML

```bash
curl -X POST https://your-worker.workers.dev/parse \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello\\n\\nThis is **bold**.",
    "options": {
      "enableMath": true,
      "enablePlugins": true
    }
  }'
```

### POST /ast

Parse markdown to AST (JSON)

```bash
curl -X POST https://your-worker.workers.dev/ast \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Title\\n\\nParagraph"
  }'
```

## 🧪 Local Testing

### Start Development Server

```bash
npm run dev:wrangler
```

Or:

```bash
npx wrangler dev --local --port 8787
```

### Run Test Suite

```bash
./test-api.sh
```

Or test manually:

```bash
curl http://localhost:8787/health
```

## 🔧 Environment Management

### Development

```bash
npx wrangler dev
```

### Staging

```bash
npm run deploy:staging
```

### Production

```bash
npm run deploy
```

## 📈 Monitoring & Logs

### View Real-time Logs

```bash
npx wrangler tail
```

### View Deployment Analytics

Visit: https://dash.cloudflare.com/ → Workers & Pages → mdparser-cf → Analytics

## 🔐 Security Best Practices

### 1. Add Rate Limiting (Recommended)

Add to `src/cloudflare/worker.ts`:

```typescript
// Simple rate limiting by IP
const rateLimits = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now - limit.timestamp > 60000) {
    rateLimits.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (limit.count >= 100) {
    // 100 requests per minute
    return false;
  }

  limit.count++;
  return true;
}
```

### 2. Add API Keys (Optional)

For private API, add authentication:

```typescript
function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === 'your-secret-key';
}
```

### 3. Configure CORS Properly

Update CORS_HEADERS in `worker.ts` to restrict origins:

```typescript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // specific domain
  // ... rest
};
```

## 💰 Pricing & Limits

### Free Tier

- **Requests**: 100,000/day
- **CPU Time**: 10ms per request
- **Size**: 1MB script size

Your current bundle: ~331KB ✅

### Paid Plans

- **Requests**: $0.50 per million
- **Duration**: $12.50 per million GB-s

[View full pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## 🐛 Troubleshooting

### Build fails

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build:worker
```

### Deployment fails

```bash
# Check authentication
npx wrangler whoami

# Verify wrangler.toml
npx wrangler deploy --dry-run
```

### Worker errors in production

```bash
# View logs
npx wrangler tail --format pretty

# Test locally first
npx wrangler dev --local
```

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Examples](https://developers.cloudflare.com/workers/examples/)

## 🎯 Next Steps

1. ✅ Deploy to production: `npm run deploy`
2. 📝 Test all endpoints with your production URL
3. 🔒 Add rate limiting and authentication as needed
4. 📊 Monitor analytics in Cloudflare dashboard
5. 🌍 Set up custom domain (optional)
6. 📢 Share your API with the world!

## 💡 Example Integration

### JavaScript/TypeScript

```javascript
const response = await fetch('https://your-worker.workers.dev/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: '# Title\\n\\nContent with **bold**',
    options: { enableMath: true },
  }),
});

const { html } = await response.json();
document.getElementById('content').innerHTML = html;
```

### Python

```python
import requests

response = requests.post('https://your-worker.workers.dev/parse', json={
    'markdown': '# Title\\n\\nContent',
    'options': {'enableMath': True}
})

html = response.json()['html']
print(html)
```

### cURL

```bash
curl -X POST https://your-worker.workers.dev/parse \\
  -H 'Content-Type: application/json' \\
  -d '{"markdown":"# Hello\\n\\nWorld"}'
```

---

**Ready to deploy?** Run `npm run deploy` and your API will be live in seconds! 🚀
