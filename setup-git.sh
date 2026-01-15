#!/bin/bash

# TECH-BRIDGE Git初期化スクリプト

echo "=== TECH-BRIDGE Git初期化スクリプト ==="
echo ""

# Gitリポジトリを初期化
echo "1. Gitリポジトリを初期化中..."
git init

# すべてのファイルを追加
echo "2. ファイルをステージング中..."
git add .

# 初回コミット
echo "3. 初回コミットを作成中..."
git commit -m "Initial commit: TECH-BRIDGE platform"

# メインブランチに名前を変更
echo "4. ブランチ名をmainに変更中..."
git branch -M main

echo ""
echo "=== 次のステップ ==="
echo ""
echo "1. GitHubでリポジトリを作成してください:"
echo "   https://github.com/new"
echo ""
echo "2. 以下のコマンドを実行してGitHubにプッシュしてください:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/tech-bridge.git"
echo "   git push -u origin main"
echo ""
echo "3. Vercelでデプロイ:"
echo "   https://vercel.com でリポジトリをインポート"
echo ""
