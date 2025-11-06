# API Authentication Setup

## 🔐 Password Protection with API Key

Your Cloudflare Worker now supports optional password protection using an API key.

## How It Works

- **Public endpoints** (no auth required): `GET /`, `GET /health`
- **Protected endpoints** (require API key if set): `POST /parse`, `POST /ast`
- If no `API_KEY` is configured, the API is **open** (no authentication required)
- If `API_KEY` is set, requests must include `X-API-Key` header

## Setup Options

### Option 1: Using Wrangler CLI (Recommended for Secrets)

Set the API key as a **secret** (encrypted, not visible in code):

```bash
# Set the API key (you'll be prompted to enter it)
npx wrangler secret put API_KEY

# Enter your desired password when prompted
# Example: mySecurePassword123!
```

This stores the API key encrypted in Cloudflare's secure storage.

### Option 2: Using Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** → **mdparser-cf** → **Settings** → **Variables**
3. Click **"Add variable"**
4. Choose **"Encrypt"** for sensitive data
5. Name: `API_KEY`
6. Value: Your desired password (e.g., `mySecurePassword123!`)
7. Click **"Save"**

### Option 3: Using Environment Variables (Development)

For local testing, add to your `.env` file:

```bash
API_KEY=mySecurePassword123!
```

Then run:
```bash
source .env && npx wrangler dev
```

## Deploy with API Key

After setting the API key via any method above:

```bash
npm run deploy
```

## Testing with API Key

### Without API Key (will fail if authentication is enabled)

```bash
curl -X POST https://mdparser-cf.yxw8611.workers.dev/parse \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test"}'

# Response: 401 Unauthorized
```

### With API Key (correct)

```bash
curl -X POST https://mdparser-cf.yxw8611.workers.dev/parse \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mySecurePassword123!" \
  -d '{"markdown": "# Test"}'

# Response: 200 OK with HTML
```

## Usage Examples

### JavaScript/TypeScript

```javascript
const response = await fetch('https://mdparser-cf.yxw8611.workers.dev/parse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'mySecurePassword123!'  // Your API key
  },
  body: JSON.stringify({
    markdown: '# Hello World',
    options: { enableMath: true }
  })
});

const { html } = await response.json();
```

### Python

```python
import requests

response = requests.post(
    'https://mdparser-cf.yxw8611.workers.dev/parse',
    headers={'X-API-Key': 'mySecurePassword123!'},
    json={
        'markdown': '# Hello World',
        'options': {'enableMath': True}
    }
)

html = response.json()['html']
```

### cURL

```bash
curl -X POST https://mdparser-cf.yxw8611.workers.dev/parse \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mySecurePassword123!" \
  -d '{
    "markdown": "# Title\n\nContent",
    "options": {"enableMath": true}
  }'
```

## Disable Authentication

To make your API public again (no authentication):

### Option 1: Delete the Secret

```bash
npx wrangler secret delete API_KEY
npm run deploy
```

### Option 2: Via Dashboard

1. Go to: **Workers & Pages** → **mdparser-cf** → **Settings** → **Variables**
2. Find `API_KEY`
3. Click **"Delete"**
4. Click **"Save and Deploy"**

## Security Best Practices

### 1. Use Strong API Keys

```bash
# Generate a secure random key
openssl rand -base64 32

# Or use UUID
uuidgen
```

### 2. Rotate Keys Regularly

```bash
# Update the API key
npx wrangler secret put API_KEY
# Enter new password

# Deploy
npm run deploy
```

### 3. Use Different Keys for Different Environments

```bash
# Development
npx wrangler secret put API_KEY --env development

# Staging
npx wrangler secret put API_KEY --env staging

# Production
npx wrangler secret put API_KEY --env production
```

### 4. Never Commit API Keys to Git

- ✅ API keys stored as Cloudflare secrets (encrypted)
- ✅ `.env` file is in `.gitignore`
- ❌ Never hardcode API keys in code

## Monitoring

### View Failed Authentication Attempts

```bash
# View real-time logs
npx wrangler tail

# You'll see 401 responses for failed auth attempts
```

### Check Access in Dashboard

Go to: **Workers & Pages** → **mdparser-cf** → **Analytics**

Filter by:
- Status code: 401 (Unauthorized)
- Review access patterns

## Advanced: Multiple API Keys

To support multiple API keys, modify `src/cloudflare/worker.ts`:

```typescript
function authenticate(request: Request, env: any): boolean {
  if (!env.API_KEY) return true;

  const apiKey = request.headers.get('X-API-Key');
  
  // Support multiple keys (comma-separated)
  const validKeys = env.API_KEY.split(',');
  return validKeys.includes(apiKey);
}
```

Then set multiple keys:
```bash
npx wrangler secret put API_KEY
# Enter: key1,key2,key3
```

## Troubleshooting

### "Unauthorized" even with correct key

1. Check the key is set:
   ```bash
   npx wrangler secret list
   ```

2. Verify you've deployed after setting the key:
   ```bash
   npm run deploy
   ```

3. Check header spelling: `X-API-Key` (case-sensitive)

### Public endpoints returning 401

This shouldn't happen - `GET /` and `GET /health` are always public.
If it does, check the code in `worker.ts` to ensure these routes are before the auth check.

---

**Your API is now secured with password protection!** 🔒

Choose your setup method and deploy:
```bash
# 1. Set API key
npx wrangler secret put API_KEY

# 2. Deploy
npm run deploy

# 3. Test
curl -H "X-API-Key: YOUR_KEY" ...
```
