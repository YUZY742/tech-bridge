#!/bin/bash

# 環境変数生成スクリプト

echo "=== TECH-BRIDGE 環境変数生成 ==="
echo ""

# JWT_SECRETを生成
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" 2>/dev/null || openssl rand -base64 32)

echo "以下の環境変数をVercel Dashboardに設定してください:"
echo ""
echo "=== フロントエンド ==="
echo "REACT_APP_API_URL=https://tech-bridge-uybw.vercel.app"
echo ""
echo "=== バックエンド ==="
echo "MONGODB_URI=mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
echo "JWT_SECRET=$JWT_SECRET"
echo "CLIENT_URL=https://tech-bridge-uybw.vercel.app"
echo "NODE_ENV=production"
echo ""
echo "⚠️  MONGODB_URIの<password>を実際のパスワードに置き換えてください"
echo ""
