# GitHubデプロイ手順

## クイックスタート

### 1. GitHubリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名: `tech-bridge`（任意）
4. PublicまたはPrivateを選択
5. 「Create repository」をクリック

### 2. ローカルでGitを初期化してプッシュ

ターミナルで以下のコマンドを実行してください：

```bash
# プロジェクトディレクトリに移動
cd /Volumes/KIOXIA_2TB/RIKOLINK/ideabattle/TechTech

# Gitリポジトリを初期化
git init

# すべてのファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: TECH-BRIDGE platform"

# メインブランチに名前を変更
git branch -M main

# GitHubリポジトリをリモートとして追加（YOUR_USERNAMEを実際のユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/tech-bridge.git

# プッシュ
git push -u origin main
```

### 3. Vercelでデプロイ（推奨・最も簡単）

#### フロントエンドとバックエンドを同時にデプロイ

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」→「Continue with GitHub」でGitHubアカウントでログイン
3. 「Add New Project」をクリック
4. `tech-bridge`リポジトリを選択
5. プロジェクト設定:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
6. 環境変数を追加:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```
7. 「Deploy」をクリック

#### バックエンドを別途デプロイ

1. Vercelで新しいプロジェクトを作成
2. 同じリポジトリを選択
3. プロジェクト設定:
   - **Root Directory**: `./server`
   - **Framework Preset**: Other
   - **Build Command**: （空欄）
   - **Output Directory**: （空欄）
4. 環境変数を追加:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_here
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
5. 「Deploy」をクリック

### 4. MongoDB Atlasの設定

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)にアクセス
2. 無料アカウントを作成
3. 「Build a Database」→「FREE」を選択
4. クラスターを作成（リージョンは最寄りを選択）
5. 「Database Access」でユーザーを作成:
   - Username: `techbridge`
   - Password: 強力なパスワードを設定
6. 「Network Access」でIPアドレスを追加:
   - 「Add IP Address」→「Allow Access from Anywhere」（0.0.0.0/0）
7. 「Connect」→「Connect your application」をクリック
8. 接続文字列をコピー（例: `mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`）
9. パスワードを実際のパスワードに置き換えて、Vercelの環境変数に設定

### 5. 環境変数の最終確認

#### フロントエンド（Vercel）
- `REACT_APP_API_URL`: バックエンドのURL（例: `https://tech-bridge-backend.vercel.app`）

#### バックエンド（Vercel）
- `MONGODB_URI`: MongoDB Atlasの接続文字列
- `JWT_SECRET`: ランダムな文字列（例: `your-super-secret-jwt-key-here`）
- `CLIENT_URL`: フロントエンドのURL（例: `https://tech-bridge.vercel.app`）
- `PORT`: （通常は自動設定、Vercelが管理）

### 6. デプロイ後の確認

1. フロントエンドURLにアクセス
2. ログイン/登録機能をテスト
3. サークル一覧が表示されるか確認
4. ブラウザの開発者ツール（F12）でエラーがないか確認

## その他のデプロイオプション

### Netlify + Railway

**Netlify（フロントエンド）:**
1. [Netlify](https://netlify.com)にGitHubでログイン
2. 「Add new site」→「Import an existing project」
3. リポジトリを選択
4. ビルド設定:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`
5. 環境変数: `REACT_APP_API_URL`

**Railway（バックエンド）:**
1. [Railway](https://railway.app)にGitHubでログイン
2. 「New Project」→「Deploy from GitHub repo」
3. リポジトリを選択
4. Root Directory: `server`
5. 環境変数を設定

### Heroku

```bash
# Heroku CLIをインストール後
heroku login

# フロントエンド
cd client
heroku create tech-bridge-frontend
heroku config:set REACT_APP_API_URL=https://tech-bridge-backend.herokuapp.com
git subtree push --prefix client heroku main

# バックエンド
cd ../server
heroku create tech-bridge-backend
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLIENT_URL=https://tech-bridge-frontend.herokuapp.com
git subtree push --prefix server heroku main
```

## トラブルシューティング

### CORSエラーが発生する
- バックエンドの`CLIENT_URL`環境変数が正しく設定されているか確認
- フロントエンドのURLと一致しているか確認

### ビルドエラー
- Node.jsのバージョンが16以上であることを確認
- `package-lock.json`がコミットされているか確認

### データベース接続エラー
- MongoDB Atlasのネットワークアクセスで`0.0.0.0/0`が許可されているか確認
- 接続文字列のパスワードが正しいか確認

### 環境変数が反映されない
- Vercel/Netlifyで環境変数を設定後、再デプロイが必要
- 変数名が正しいか確認（特に`REACT_APP_`プレフィックス）

## 継続的デプロイ

GitHubにプッシュすると、Vercel/Netlifyが自動的に再デプロイします。

GitHub Actionsワークフローも設定済みです。リポジトリのSettings > Secretsで以下を設定してください：
- `MONGODB_URI`
- `JWT_SECRET`
- `VERCEL_TOKEN`（Vercel使用時）
