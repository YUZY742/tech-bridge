# TECH-BRIDGE デプロイガイド

## GitHubへのデプロイ手順

### 1. GitHubリポジトリの作成

1. GitHubにログインして、新しいリポジトリを作成します
2. リポジトリ名を `tech-bridge` などに設定します
3. リポジトリを作成したら、URLをコピーします（例: `https://github.com/yourusername/tech-bridge.git`）

### 2. ローカルリポジトリの設定

```bash
# リポジトリを初期化（既に初期化済みの場合はスキップ）
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: TECH-BRIDGE platform"

# GitHubリポジトリをリモートとして追加
git remote add origin https://github.com/yourusername/tech-bridge.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### 3. デプロイオプション

#### オプションA: Vercel（推奨）

Vercelはフロントエンドとバックエンドの両方を簡単にデプロイできます。

1. [Vercel](https://vercel.com)にアカウントを作成
2. GitHubリポジトリをインポート
3. プロジェクト設定:
   - **Root Directory**: `/` (ルート)
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm run install-all`
4. 環境変数を設定:
   - `MONGODB_URI`: MongoDB接続文字列
   - `JWT_SECRET`: JWT秘密鍵
   - `REACT_APP_API_URL`: バックエンドAPIのURL

#### オプションB: Netlify + Railway

**フロントエンド（Netlify）:**
1. [Netlify](https://netlify.com)にアカウントを作成
2. GitHubリポジトリを接続
3. ビルド設定:
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`
4. 環境変数:
   - `REACT_APP_API_URL`: バックエンドAPIのURL

**バックエンド（Railway）:**
1. [Railway](https://railway.app)にアカウントを作成
2. GitHubリポジトリを接続
3. サービス設定:
   - Root Directory: `server`
   - Start Command: `npm start`
4. 環境変数を設定:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (自動設定)

#### オプションC: Heroku

**フロントエンド:**
```bash
# Heroku CLIをインストール後
cd client
heroku create tech-bridge-frontend
git subtree push --prefix client heroku main
```

**バックエンド:**
```bash
cd server
heroku create tech-bridge-backend
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
git subtree push --prefix server heroku main
```

#### オプションD: GitHub Pages（フロントエンドのみ）

1. GitHubリポジトリのSettings > Pagesに移動
2. Sourceを`gh-pages`ブランチに設定
3. GitHub Actionsワークフローが自動的にデプロイします

### 4. 環境変数の設定

各デプロイプラットフォームで以下の環境変数を設定してください:

#### バックエンド
- `MONGODB_URI`: MongoDB接続文字列（MongoDB Atlas推奨）
- `JWT_SECRET`: JWT認証用の秘密鍵
- `PORT`: サーバーポート（通常は自動設定）
- `CLIENT_URL`: フロントエンドのURL（CORS用）

#### フロントエンド
- `REACT_APP_API_URL`: バックエンドAPIのURL

### 5. MongoDB Atlasの設定

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)でアカウント作成
2. クラスターを作成
3. データベースユーザーを作成
4. ネットワークアクセスを設定（0.0.0.0/0で全許可、またはデプロイ先のIPを許可）
5. 接続文字列を取得して環境変数に設定

### 6. デプロイ後の確認

- フロントエンドが正常に表示されるか
- APIエンドポイントが動作するか
- 認証機能が動作するか
- データベース接続が正常か

## トラブルシューティング

### CORSエラー
バックエンドの`server/index.js`で`CLIENT_URL`環境変数を正しく設定してください。

### ビルドエラー
- Node.jsのバージョンを確認（v16以上推奨）
- 依存関係が正しくインストールされているか確認

### データベース接続エラー
- MongoDB Atlasのネットワークアクセス設定を確認
- 接続文字列が正しいか確認

## 継続的デプロイ（CI/CD）

GitHub Actionsワークフローが設定されています。`main`ブランチにプッシュすると自動的にデプロイされます。

必要なシークレットをGitHubリポジトリのSettings > Secretsに設定してください:
- `MONGODB_URI`
- `JWT_SECRET`
- `VERCEL_TOKEN` (Vercel使用時)
- `VERCEL_ORG_ID` (Vercel使用時)
- `VERCEL_PROJECT_ID` (Vercel使用時)
