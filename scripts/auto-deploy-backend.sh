#!/bin/bash

# バックエンド自動デプロイスクリプト

echo "=== TECH-BRIDGE バックエンド自動デプロイ ==="
echo ""

# Vercel CLIがインストールされているか確認
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLIをインストール中..."
    npm install -g vercel
fi

cd server

# Vercelプロジェクトをリンク
if [ ! -f ".vercel/project.json" ]; then
    echo "Vercelプロジェクトを作成中..."
    vercel link --yes --scope=YUZY742 --name=tech-bridge-backend 2>&1 || vercel link --yes --name=tech-bridge-backend
fi

echo ""
echo "本番環境にデプロイ中..."
vercel --prod --yes

echo ""
echo "=== デプロイ完了 ==="
echo "バックエンドがデプロイされました！"
