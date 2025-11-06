#!/bin/bash
# Test script for Cloudflare Worker API

BASE_URL="${1:-http://localhost:8787}"

echo "🧪 Testing Markdown Parser API at $BASE_URL"
echo ""

# Test 1: Health check
echo "1️⃣  Testing /health endpoint..."
curl -s "$BASE_URL/health" | jq .
echo ""

# Test 2: Parse simple markdown
echo "2️⃣  Testing /parse endpoint with simple markdown..."
curl -s -X POST "$BASE_URL/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Hello World\n\nThis is **bold** and *italic* text."
  }' | jq '.html, .processingTime'
echo ""

# Test 3: Parse markdown with math
echo "3️⃣  Testing /parse endpoint with math formulas..."
curl -s -X POST "$BASE_URL/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "Einstein said $E=mc^2$.\n\n$$\\frac{a}{b}$$",
    "options": {
      "enableMath": true
    }
  }' | jq '.processingTime, .stats'
echo ""

# Test 4: Get AST
echo "4️⃣  Testing /ast endpoint..."
curl -s -X POST "$BASE_URL/ast" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Title\n\nParagraph"
  }' | jq '.ast.type, .ast.children[].type'
echo ""

# Test 5: Error handling
echo "5️⃣  Testing error handling (missing markdown field)..."
curl -s -X POST "$BASE_URL/parse" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
echo ""

echo "✅ Tests complete!"
