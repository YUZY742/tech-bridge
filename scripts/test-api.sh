#!/bin/bash

# API動作確認スクリプト

API_URL="https://tech-bridge-uybw.vercel.app"

echo "=== TECH-BRIDGE API動作確認 ==="
echo ""

echo "1. フロントエンド確認..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ フロントエンド: 正常 ($FRONTEND_STATUS)"
else
    echo "❌ フロントエンド: エラー ($FRONTEND_STATUS)"
fi

echo ""
echo "2. バックエンドAPI確認..."
API_RESPONSE=$(curl -s "$API_URL/api/circles" 2>&1)
if echo "$API_RESPONSE" | grep -q "buffering timed out"; then
    echo "⚠️  バックエンドAPI: MongoDB接続が必要"
    echo "   環境変数 MONGODB_URI を設定してください"
elif echo "$API_RESPONSE" | grep -q "message"; then
    echo "⚠️  バックエンドAPI: エラー"
    echo "$API_RESPONSE" | head -3
else
    echo "✅ バックエンドAPI: 正常"
fi

echo ""
echo "3. 認証エンドポイント確認..."
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/me")
if [ "$AUTH_STATUS" = "401" ]; then
    echo "✅ 認証エンドポイント: 正常 (401 = 認証が必要)"
elif [ "$AUTH_STATUS" = "200" ]; then
    echo "✅ 認証エンドポイント: 正常"
else
    echo "⚠️  認証エンドポイント: ステータス $AUTH_STATUS"
fi

echo ""
echo "=== 確認完了 ==="
echo ""
echo "次のステップ:"
echo "1. MongoDB Atlasの接続文字列を取得"
echo "2. Vercel Dashboardで環境変数を設定"
echo "3. 再デプロイ"
