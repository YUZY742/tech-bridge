#!/bin/bash

# Vercel自動デプロイセットアップスクリプト

echo "=== Vercel自動デプロイセットアップ ==="
echo ""
echo "このスクリプトはVercel CLIを使って自動デプロイを設定します。"
echo ""

# Vercel CLIがインストールされているか確認
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLIをインストール中..."
    npm install -g vercel
fi

echo ""
echo "=== フロントエンドのデプロイ ==="
cd client

# Vercelプロジェクトをリンク（既存の場合はスキップ）
if [ ! -f ".vercel/project.json" ]; then
    echo "Vercelプロジェクトを作成中..."
    vercel link --yes --scope=YUZY742 2>&1 || vercel link --yes
fi

echo "本番環境にデプロイ中..."
vercel --prod --yes

cd ..

echo ""
echo "=== バックエンドのデプロイ ==="
cd server

# Vercelプロジェクトをリンク
if [ ! -f ".vercel/project.json" ]; then
    echo "Vercelプロジェクトを作成中..."
    vercel link --yes --scope=YUZY742 2>&1 || vercel link --yes
fi

echo "本番環境にデプロイ中..."
vercel --prod --yes

cd ..

echo ""
echo "=== デプロイ完了 ==="
echo "フロントエンドとバックエンドがデプロイされました！"
echo "Vercel Dashboardで確認してください: https://vercel.com/dashboard"
