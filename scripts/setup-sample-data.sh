#!/bin/bash

# サンプルデータセットアップスクリプト

echo "=== TECH-BRIDGE サンプルデータセットアップ ==="
echo ""

# 環境変数を確認
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI環境変数が設定されていません"
    echo ""
    echo "ローカル開発の場合:"
    echo "  export MONGODB_URI=mongodb://localhost:27017/tech-bridge"
    echo ""
    echo "本番環境の場合:"
    echo "  Vercel Dashboardで環境変数を設定してください"
    echo ""
    read -p "続行しますか？ (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

cd server

echo "サンプルデータを挿入中..."
npm run seed

echo ""
echo "✅ サンプルデータのセットアップが完了しました！"
echo ""
echo "以下のサークルが作成されました:"
echo "- 九州大学 QPIC (ロケット)"
echo "- 東京工業大学 ロボコン部 (ロボコン)"
echo "- 名古屋大学 鳥人間プロジェクト (鳥人間)"
echo "- 新規ロケットサークル (ルーキー)"
