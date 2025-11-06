# Securing Your API Key - Best Practices

## ⚠️ The Problem

When you send `X-API-Key` header from a browser/client, the API key is exposed in the network request. Anyone can:

- View it in browser DevTools (Network tab)
- Intercept it if not using HTTPS (though Cloudflare always uses HTTPS)
- Extract it from your frontend code

## ✅ **Best Solutions**

### **Solution 1: Backend Proxy (RECOMMENDED for Web Apps)**

**Never expose the API key in frontend code.** Instead, create a backend server that acts as a proxy:

```
[Browser] → [Your Backend] → [Cloudflare Worker]
          (no API key)    (with API key stored securely)
```

#### Example Setup:

**Your Backend (Node.js/Express):**

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/parse', async (req, res) => {
  try {
    const response = await fetch('https://mdparser-cf.yxw8611.workers.dev/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.CLOUDFLARE_API_KEY, // Stored in .env file
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse markdown' });
  }
});

app.listen(3000);
```

**.env file:**

```
CLOUDFLARE_API_KEY=82193031
```

**Frontend (Safe - No API Key Exposed):**

```javascript
// Your website/app
const response = await fetch('http://your-domain.com/api/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: '# Hello World',
  }),
});

const { html } = await response.json();
```

✅ **API key stays on your server**  
✅ **Not visible in browser**  
✅ **Full control over rate limiting, logging, etc.**

---

### **Solution 2: Domain Restriction (Additional Security Layer)**

Restrict your Worker to only accept requests from specific domains:

#### Set in Cloudflare Dashboard:

1. Go to: https://dash.cloudflare.com/
2. **Workers & Pages** → **mdparser-cf** → **Settings** → **Variables**
3. Add environment variable:
   ```
   ALLOWED_ORIGINS = https://yourdomain.com,https://app.yourdomain.com
   ```

This way:

- Even if someone gets the API key, they can't use it from their domain
- Only requests from your allowed domains will work
- Adds extra protection layer

---

### **Solution 3: Cloudflare Access / Zero Trust (Enterprise)**

Use Cloudflare's built-in authentication instead of API keys:

1. Go to: https://dash.cloudflare.com/ → **Zero Trust**
2. Set up **Access Application** for your Worker
3. Configure authentication (Google, GitHub, email OTP, etc.)
4. Users authenticate once, Cloudflare handles the rest

✅ **No API keys needed**  
✅ **Enterprise-grade security**  
✅ **User-based access control**

---

### **Solution 4: Serverless Functions (Vercel, Netlify, AWS Lambda)**

Deploy a simple serverless function that calls your Worker:

**Vercel Example (`api/parse.js`):**

```javascript
export default async function handler(req, res) {
  const response = await fetch('https://mdparser-cf.yxw8611.workers.dev/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.CLOUDFLARE_API_KEY,
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.json(data);
}
```

Deploy to Vercel:

```bash
vercel env add CLOUDFLARE_API_KEY
vercel deploy
```

Your frontend calls: `https://your-app.vercel.app/api/parse`

---

## 🔒 **Additional Security Measures**

### 1. Rate Limiting by IP

Add to your Worker to prevent abuse even if key is exposed:

```typescript
// Track requests by IP
const rateLimits = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `rate_${ip}`;
  const limit = rateLimits.get(key);

  if (!limit || now - limit.timestamp > 60000) {
    rateLimits.set(key, { count: 1, timestamp: now });
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

### 2. Rotate API Keys Regularly

```bash
# Generate new key
npx wrangler secret put API_KEY

# Deploy
npm run deploy
```

### 3. Monitor Usage

```bash
# View real-time logs
npx wrangler tail

# Check analytics
# https://dash.cloudflare.com/ → Workers & Pages → mdparser-cf → Analytics
```

---

## 📊 **Comparison of Solutions**

| Solution                | Security   | Complexity | Cost      | Best For                |
| ----------------------- | ---------- | ---------- | --------- | ----------------------- |
| **Backend Proxy**       | ⭐⭐⭐⭐⭐ | Medium     | Low       | Web apps, production    |
| **Domain Restriction**  | ⭐⭐⭐     | Low        | Free      | Additional layer        |
| **Cloudflare Access**   | ⭐⭐⭐⭐⭐ | Medium     | $$        | Enterprise              |
| **Serverless Function** | ⭐⭐⭐⭐⭐ | Low        | Free tier | Quick setup             |
| **API Key Only**        | ⭐⭐       | Very Low   | Free      | Testing, internal tools |

---

## 🎯 **Recommended Approach**

### For Web Applications (Public):

```
1. Set up Backend Proxy (Node.js, Vercel, Netlify, etc.)
2. Add Domain Restriction (ALLOWED_ORIGINS)
3. Implement Rate Limiting
4. Rotate API keys monthly
```

### For Internal Tools:

```
1. Use API key directly
2. Add IP whitelisting in Cloudflare
3. Use VPN if accessing externally
```

### For Mobile Apps:

```
1. Create Backend API (your server)
2. Use app-specific authentication (JWT, OAuth)
3. Backend calls Cloudflare Worker with API key
```

---

## ⚡ **Quick Implementation (Backend Proxy)**

**Option A: Simple Node.js Server**

```bash
# Create new project
mkdir markdown-proxy
cd markdown-proxy
npm init -y
npm install express dotenv node-fetch

# Create .env
echo "CLOUDFLARE_API_KEY=82193031" > .env
echo "PORT=3000" >> .env

# Create server.js (see example above)

# Run
node server.js
```

**Option B: Deploy to Vercel (Instant)**

```bash
# Create api/parse.js with serverless function
# Add CLOUDFLARE_API_KEY to Vercel environment
vercel deploy
```

**Option C: Use Cloudflare Worker as Proxy**

Create another Worker that calls your markdown Worker:

```typescript
export default {
  async fetch(request: Request, env: any) {
    const response = await fetch('https://mdparser-cf.yxw8611.workers.dev/parse', {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': env.MARKDOWN_API_KEY, // Stored as secret
      },
      body: request.body,
    });

    return response;
  },
};
```

---

## 🚨 **What NOT to Do**

❌ **Never** hardcode API keys in frontend JavaScript  
❌ **Never** commit API keys to Git  
❌ **Never** expose API keys in client-side code  
❌ **Don't** use API keys for public-facing apps without a proxy

---

**Bottom Line:** If your users access the API from a browser, **always use a backend proxy**. The API key should never be in frontend code.

Need help setting up a specific solution? Let me know which approach you want to implement!
