#!/bin/bash

# MongoDB Atlas自動セットアップガイド

echo "=== MongoDB Atlas セットアップガイド ==="
echo ""
echo "以下の手順でMongoDB Atlasを設定してください："
echo ""
echo "1. https://www.mongodb.com/cloud/atlas にアクセス"
echo "2. 無料アカウントを作成"
echo "3. クラスターを作成（FREE tier）"
echo "4. データベースユーザーを作成:"
echo "   - Username: techbridge"
echo "   - Password: 強力なパスワードを設定"
echo "5. ネットワークアクセス:"
echo "   - 'Add IP Address' → 'Allow Access from Anywhere' (0.0.0.0/0)"
echo "6. 'Connect' → 'Connect your application'"
echo "7. 接続文字列をコピー"
echo ""
echo "接続文字列の形式:"
echo "mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
echo ""
echo "この接続文字列をVercelの環境変数 MONGODB_URI に設定してください。"
echo ""
