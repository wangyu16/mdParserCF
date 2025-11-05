#!/bin/bash
# Devcontainer setup script for mdParserCF project

set -e

echo "🚀 Setting up mdParserCF development environment..."

# Update package manager
echo "📦 Updating package manager..."
apt-get update
apt-get install -y --no-install-recommends \
    curl \
    wget \
    git \
    ca-certificates

# Install Node.js dependencies
echo "📚 Installing Node.js dependencies..."
npm install -g npm@latest
npm install -g pnpm

# Navigate to workspace and install project dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing project dependencies with npm..."
    npm install
else
    echo "⚠️  package.json not found. You may need to initialize the project."
fi

# Install Wrangler CLI for Cloudflare Workers
echo "☁️  Installing Wrangler CLI (Cloudflare Workers)..."
npm install -g wrangler

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p src/parser
mkdir -p src/plugins
mkdir -p src/utils
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p dist
mkdir -p docs

# Set up Git hooks (if husky is installed later)
if [ -f "package.json" ] && grep -q '"husky"' "package.json"; then
    echo "🪝 Setting up Git hooks with husky..."
    npx husky install
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review the project blueprint: bluePrint/projectBlueprint.md"
echo "   2. Check the markdown rendering rules: bluePrint/markdownRenderRules.md"
echo "   3. Initialize package.json if not present: npm init"
echo "   4. Run tests: npm test"
echo "   5. Start local dev server: npm run dev"
echo "   6. Deploy to Cloudflare: wrangler deploy"
echo ""
echo "📖 For more information, see:"
echo "   - Wrangler docs: https://developers.cloudflare.com/workers/wrangler/"
echo "   - Node.js docs: https://nodejs.org/docs/"
echo ""
