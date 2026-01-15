#!/bin/bash

# TECH-BRIDGE 完全自動セットアップスクリプト

echo "=========================================="
echo "  TECH-BRIDGE 完全セットアップ"
echo "=========================================="
echo ""

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ステップ1: 環境変数の生成
echo -e "${BLUE}ステップ1: 環境変数の生成${NC}"
echo ""
./scripts/generate-env.sh

echo ""
echo -e "${YELLOW}⚠️  次のステップは手動で実行する必要があります:${NC}"
echo ""
echo "1. MongoDB Atlasのセットアップ:"
echo "   - https://www.mongodb.com/cloud/atlas にアクセス"
echo "   - 無料アカウントを作成"
echo "   - クラスターを作成（FREE tier）"
echo "   - データベースユーザーを作成"
echo "   - ネットワークアクセス: 0.0.0.0/0 を許可"
echo "   - 接続文字列を取得"
echo ""
echo "2. Vercel Dashboardで環境変数を設定:"
echo "   - https://vercel.com/dashboard"
echo "   - tech-bridge-uybw プロジェクトを開く"
echo "   - Settings → Environment Variables"
echo "   - 上記で生成された環境変数を設定"
echo ""
echo "3. 再デプロイ後、サンプルデータを投入:"
echo "   ./scripts/setup-sample-data.sh"
echo ""
echo "4. 動作確認:"
echo "   ./scripts/test-api.sh"
echo ""

echo -e "${GREEN}詳細は QUICK_START.md を参照してください${NC}"
