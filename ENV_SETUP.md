# 環境変数セットアップガイド

## 必要な環境変数

### フロントエンド（Vercel）

```
REACT_APP_API_URL=https://tech-bridge-uybw.vercel.app
```

### バックエンド（Vercel）

```
MONGODB_URI=mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-minimum-32-characters-long
CLIENT_URL=https://tech-bridge-uybw.vercel.app
NODE_ENV=production
```

## セットアップ手順

### 1. MongoDB Atlasの設定

1. https://www.mongodb.com/cloud/atlas にアクセス
2. 無料アカウントを作成
3. 「Build a Database」→「FREE」を選択
4. クラスターを作成（リージョンは最寄りを選択）
5. 「Database Access」でユーザーを作成:
   - Username: `techbridge`
   - Password: 強力なパスワードを設定
6. 「Network Access」でIPアドレスを追加:
   - 「Add IP Address」→「Allow Access from Anywhere」（0.0.0.0/0）
7. 「Connect」→「Connect your application」をクリック
8. 接続文字列をコピー

### 2. JWT_SECRETの生成

ランダムな文字列を生成（最低32文字）:
```bash
# 方法1: OpenSSLを使用
openssl rand -base64 32

# 方法2: Node.jsを使用
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Vercel Dashboardで環境変数を設定

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `tech-bridge-uybw`プロジェクトを開く
3. **Settings → Environment Variables** に移動
4. 以下の環境変数を追加:

   **Production環境:**
   - `MONGODB_URI`: MongoDB Atlasの接続文字列
   - `JWT_SECRET`: 生成したランダム文字列
   - `CLIENT_URL`: `https://tech-bridge-uybw.vercel.app`
   - `REACT_APP_API_URL`: `https://tech-bridge-uybw.vercel.app`
   - `NODE_ENV`: `production`

5. 「Save」をクリック
6. 「Deployments」タブで「Redeploy」をクリック

## 環境変数の確認

設定後、以下で動作確認:
```bash
# フロントエンド
curl https://tech-bridge-uybw.vercel.app

# バックエンドAPI
curl https://tech-bridge-uybw.vercel.app/api/auth/me
```

## トラブルシューティング

### 環境変数が反映されない
- 環境変数を設定後、必ず「Redeploy」を実行
- Production環境に設定されているか確認

### MongoDB接続エラー
- ネットワークアクセスで`0.0.0.0/0`が許可されているか確認
- 接続文字列のパスワードが正しいか確認

### CORSエラー
- `CLIENT_URL`がフロントエンドのURLと一致しているか確認
