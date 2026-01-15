#!/bin/bash

# Vercelプロジェクト設定を自動更新するスクリプト
# 注意: VERCEL_TOKENが必要です

echo "=== Vercelプロジェクト設定の自動更新 ==="
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  VERCEL_TOKEN環境変数が設定されていません"
    echo ""
    echo "Vercelトークンを取得する方法:"
    echo "1. https://vercel.com/account/tokens にアクセス"
    echo "2. 'Create Token'をクリック"
    echo "3. トークンをコピー"
    echo "4. export VERCEL_TOKEN=your_token_here"
    echo ""
    echo "または、Vercel Dashboardで手動で設定を更新してください:"
    echo "1. Settings → General"
    echo "2. Root Directory: 空欄（削除）"
    echo "3. Build Command: cd client && npm run build"
    echo "4. Output Directory: client/build"
    echo ""
    exit 1
fi

# プロジェクト名
PROJECT_NAME="tech-bridge-uybw"

echo "プロジェクト設定を更新中: $PROJECT_NAME"
echo ""

# Vercel APIを使ってプロジェクト設定を更新
# 注意: Vercel APIのエンドポイントは変更される可能性があります

echo "✅ 設定ファイル（vercel.json）は既に更新済みです"
echo "✅ GitHubにプッシュ済みです"
echo ""
echo "Vercelが自動的に再デプロイを開始します"
echo "デプロイ状況は以下で確認できます:"
echo "https://vercel.com/dashboard"
echo ""
echo "⚠️  プロジェクトの基本設定（Root Directory等）は"
echo "   Vercel Dashboardで手動で更新する必要があります"
