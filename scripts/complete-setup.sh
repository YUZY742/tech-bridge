#!/bin/bash

# TECH-BRIDGE 完全セットアップスクリプト

echo "=========================================="
echo "  TECH-BRIDGE 完全自動セットアップ"
echo "=========================================="
echo ""

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}ステップ1: 依存関係のインストール${NC}"
npm run install-all

echo ""
echo -e "${GREEN}ステップ2: 環境変数ファイルの作成${NC}"

# サーバー用の.env.exampleを作成
cat > server/.env.example << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tech-bridge
JWT_SECRET=your-secret-key-change-in-production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
EOF

# クライアント用の.env.exampleを作成
cat > client/.env.example << EOF
REACT_APP_API_URL=http://localhost:5000
EOF

echo "✅ .env.exampleファイルを作成しました"

echo ""
echo -e "${YELLOW}ステップ3: Vercelデプロイの準備${NC}"
echo ""
echo "以下の手順でVercelにデプロイしてください："
echo ""
echo "1. フロントエンド:"
echo "   - Vercel Dashboard → Add New Project"
echo "   - Root Directory: client"
echo "   - 環境変数: REACT_APP_API_URL (バックエンドURL)"
echo ""
echo "2. バックエンド:"
echo "   - Vercel Dashboard → Add New Project"
echo "   - Root Directory: server"
echo "   - 環境変数:"
echo "     * MONGODB_URI (MongoDB Atlas接続文字列)"
echo "     * JWT_SECRET (ランダムな文字列)"
echo "     * CLIENT_URL (フロントエンドURL)"
echo ""
echo "3. MongoDB Atlas:"
echo "   - https://www.mongodb.com/cloud/atlas でアカウント作成"
echo "   - クラスター作成"
echo "   - ネットワークアクセス: 0.0.0.0/0 を許可"
echo "   - 接続文字列を取得してVercelに設定"
echo ""

echo -e "${GREEN}セットアップスクリプト完了！${NC}"
echo ""
echo "詳細は NEXT_STEPS.md を参照してください。"
