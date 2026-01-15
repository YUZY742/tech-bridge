# 🚀 自動デプロイ完了ガイド

## ✅ 現在の状態

- ✅ GitHubリポジトリ: https://github.com/YUZY742/tech-bridge
- ✅ フロントエンドデプロイ済み: tech-bridge-uybw
- ✅ コードの環境変数対応完了
- ✅ 自動デプロイスクリプト作成済み

## 🎯 残りの作業（自動化準備完了）

以下の作業を実行すると、完全に自動デプロイが有効になります：

### 方法1: Vercel Web UI（推奨・最も簡単）

#### バックエンドのデプロイ

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New Project」をクリック
3. `tech-bridge`リポジトリを選択
4. 設定:
   - **Project Name**: `tech-bridge-backend`
   - **Root Directory**: `server`
   - **Framework Preset**: Other
5. 環境変数を追加:
   ```
   MONGODB_URI=mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   JWT_SECRET=your-random-secret-key-here
   CLIENT_URL=https://tech-bridge-uybw.vercel.app
   NODE_ENV=production
   ```
6. 「Deploy」をクリック

#### フロントエンドの環境変数更新

1. フロントエンドプロジェクトのSettings → Environment Variables
2. `REACT_APP_API_URL`を追加/更新:
   ```
   REACT_APP_API_URL=https://tech-bridge-backend.vercel.app
   ```
3. 「Redeploy」をクリック

### 方法2: スクリプトを使用（CLI認証が必要）

```bash
# バックエンドのデプロイ
./scripts/auto-deploy-backend.sh
```

## 📋 環境変数チェックリスト

### フロントエンド（Vercel）
- [ ] `REACT_APP_API_URL`: バックエンドのURL

### バックエンド（Vercel）
- [ ] `MONGODB_URI`: MongoDB Atlasの接続文字列
- [ ] `JWT_SECRET`: ランダムな文字列
- [ ] `CLIENT_URL`: フロントエンドのURL
- [ ] `NODE_ENV`: `production`

## 🔧 MongoDB Atlasのセットアップ

```bash
# セットアップガイドを表示
./scripts/setup-mongodb.sh
```

または手動で：
1. https://www.mongodb.com/cloud/atlas にアクセス
2. 無料アカウント作成
3. クラスター作成（FREE tier）
4. データベースユーザー作成
5. ネットワークアクセス: `0.0.0.0/0` を許可
6. 接続文字列を取得

## 🎉 デプロイ後の確認

1. フロントエンドURLにアクセス
2. ユーザー登録をテスト
3. ログインをテスト
4. サークル一覧が表示されるか確認
5. API接続が正常に動作するか確認

## 📚 参考リンク

- リポジトリ: https://github.com/YUZY742/tech-bridge
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- GitHub Actions: https://github.com/YUZY742/tech-bridge/actions

## 💡 自動デプロイの仕組み

GitHubにプッシュすると：
1. Vercelが自動検知（Web UIで接続済みの場合）
2. 自動ビルド
3. 自動デプロイ
4. 本番環境で動作

完全自動化されています！
