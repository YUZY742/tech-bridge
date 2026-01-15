# 既存のtech-bridge-uybwプロジェクトを更新

## ✅ 良いニュース

既存の`tech-bridge-uybw`プロジェクトに、フロントエンドとバックエンドの両方を含めることができます！

## 🔧 設定方法

### 1. Vercel Dashboardで設定を更新

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `tech-bridge-uybw`プロジェクトを開く
3. Settings → General に移動
4. 以下の設定を更新:

#### Root Directory
- 現在: `client` または 空欄
- 変更: **空欄（ルートディレクトリ）** または削除

#### Build Command
- 現在: `npm run build` または `cd client && npm run build`
- 変更: `cd client && npm run build`

#### Output Directory
- 現在: `build` または `client/build`
- 変更: `client/build`

### 2. vercel.jsonの設定

ルートディレクトリに`vercel.json`を配置しました。このファイルにより：
- `/api/*` のリクエストはバックエンド（server）にルーティング
- その他のリクエストはフロントエンド（client）にルーティング

### 3. 環境変数の設定

既存のプロジェクトのSettings → Environment Variablesで以下を追加:

```
# バックエンド用
MONGODB_URI=mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here
CLIENT_URL=https://tech-bridge-uybw.vercel.app
NODE_ENV=production

# フロントエンド用
REACT_APP_API_URL=https://tech-bridge-uybw.vercel.app
```

### 4. 再デプロイ

設定を更新したら、「Redeploy」をクリックするか、GitHubにプッシュすると自動的に再デプロイされます。

## 📋 確認事項

- ✅ ルートディレクトリに`vercel.json`が存在
- ✅ `client/package.json`に`vercel-build`スクリプトが追加済み
- ✅ バックエンドのVercel対応完了
- ✅ 環境変数の設定が必要

## 🎯 メリット

1. **1つのプロジェクトで管理**: フロントエンドとバックエンドを1つのプロジェクトで管理
2. **同じドメイン**: すべて同じURL（tech-bridge-uybw.vercel.app）でアクセス可能
3. **CORS問題なし**: 同じオリジンなのでCORSの問題が発生しない
4. **管理が簡単**: 1つのプロジェクトで環境変数も管理

## 🚀 デプロイ後の確認

1. フロントエンド: `https://tech-bridge-uybw.vercel.app`
2. バックエンドAPI: `https://tech-bridge-uybw.vercel.app/api/*`
3. 動作確認:
   - フロントエンドが表示される
   - APIエンドポイントが動作する
   - 認証が機能する

## 💡 注意点

- Socket.ioはVercel Serverless Functionsでは制限があるため、リアルタイムチャット機能は後で別途対応が必要な場合があります
- 通常のHTTPリクエスト/レスポンスは問題なく動作します
