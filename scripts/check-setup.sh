#!/bin/bash

# セットアップ状況確認スクリプト

API_URL="https://tech-bridge-uybw.vercel.app"

echo "=== TECH-BRIDGE セットアップ状況確認 ==="
echo ""

# 1. フロントエンド確認
echo "1. フロントエンド..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ 正常 ($FRONTEND_STATUS)"
else
    echo "   ❌ エラー ($FRONTEND_STATUS)"
fi

# 2. ヘルスチェック
echo "2. ヘルスチェック..."
HEALTH_RESPONSE=$(curl -s "$API_URL/api/health" 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "   ✅ 正常"
    if echo "$HEALTH_RESPONSE" | grep -q '"connected":true'; then
        echo "   ✅ データベース接続: 正常"
    else
        echo "   ⚠️  データベース接続: 未接続"
        echo "      → MONGODB_URI環境変数を設定してください"
    fi
else
    echo "   ⚠️  確認中..."
fi

# 3. サークル一覧API
echo "3. サークル一覧API..."
CIRCLES_RESPONSE=$(curl -s "$API_URL/api/circles" 2>&1)
if echo "$CIRCLES_RESPONSE" | grep -q "buffering timed out"; then
    echo "   ⚠️  MongoDB接続が必要"
elif echo "$CIRCLES_RESPONSE" | grep -q "_id"; then
    CIRCLE_COUNT=$(echo "$CIRCLES_RESPONSE" | grep -o "_id" | wc -l | tr -d ' ')
    echo "   ✅ 正常 (サークル数: $CIRCLE_COUNT)"
    if [ "$CIRCLE_COUNT" = "0" ]; then
        echo "   💡 サンプルデータを投入してください: ./scripts/setup-sample-data.sh"
    fi
else
    echo "   ⚠️  確認中..."
fi

# 4. 認証エンドポイント
echo "4. 認証エンドポイント..."
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/me")
if [ "$AUTH_STATUS" = "401" ]; then
    echo "   ✅ 正常 (401 = 認証が必要)"
else
    echo "   ⚠️  ステータス: $AUTH_STATUS"
fi

echo ""
echo "=== セットアップチェックリスト ==="
echo ""
echo "[ ] MongoDB Atlasアカウント作成"
echo "[ ] MongoDB Atlasクラスター作成"
echo "[ ] データベースユーザー作成"
echo "[ ] ネットワークアクセス設定 (0.0.0.0/0)"
echo "[ ] MONGODB_URI環境変数をVercelに設定"
echo "[ ] JWT_SECRET環境変数をVercelに設定"
echo "[ ] CLIENT_URL環境変数をVercelに設定"
echo "[ ] REACT_APP_API_URL環境変数をVercelに設定"
echo "[ ] Vercelで再デプロイ"
echo "[ ] サンプルデータの投入"
echo ""
echo "詳細: QUICK_START.md を参照"
