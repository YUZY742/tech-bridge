# 自動デプロイ設定ガイド

## ✅ 完了した作業

- ✅ GitHubリポジトリ作成: https://github.com/YUZY742/tech-bridge
- ✅ コードのプッシュ完了
- ✅ GitHub Actionsワークフローの設定

## 🚀 自動デプロイを有効化する方法

### 方法1: Vercel Web UIで自動デプロイ（最も簡単・推奨）

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」→「Continue with GitHub」でログイン
3. 「Add New Project」をクリック
4. `tech-bridge`リポジトリを選択
5. プロジェクト設定:
   - **Project Name**: `tech-bridge-frontend`
   - **Root Directory**: `client`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. 環境変数を追加:
   - `REACT_APP_API_URL`: バックエンドのURL（後で設定）
7. 「Deploy」をクリック

**これで、GitHubにプッシュするたびに自動でデプロイされます！**

### 方法2: GitHub Actionsで自動デプロイ（Vercelトークンが必要）

#### ステップ1: Vercelトークンを取得

1. [Vercel Dashboard](https://vercel.com/account/tokens)にアクセス
2. 「Create Token」をクリック
3. トークン名を入力して作成
4. トークンをコピー

#### ステップ2: VercelプロジェクトIDを取得

1. Vercelでプロジェクトを作成（方法1を先に実行）
2. プロジェクトのSettings → General
3. Project IDをコピー

#### ステップ3: GitHub Secretsを設定

1. GitHubリポジトリ: https://github.com/YUZY742/tech-bridge
2. Settings → Secrets and variables → Actions
3. 以下のSecretsを追加:

```
VERCEL_TOKEN: （Vercelトークン）
VERCEL_ORG_ID: （Vercel組織ID、Settings → Generalで確認）
VERCEL_PROJECT_ID: （フロントエンドのプロジェクトID）
VERCEL_PROJECT_ID_BACKEND: （バックエンドのプロジェクトID）
REACT_APP_API_URL: （バックエンドのURL）
MONGODB_URI: （MongoDB接続文字列）
JWT_SECRET: （JWT秘密鍵）
```

#### ステップ4: 自動デプロイの確認

GitHubにプッシュすると、自動的にデプロイが開始されます：
- Actionsタブでデプロイ状況を確認
- 成功するとVercelに自動デプロイされます

## 📝 環境変数の設定

### フロントエンド（Vercel）
- `REACT_APP_API_URL`: バックエンドのURL（例: `https://tech-bridge-backend.vercel.app`）

### バックエンド（Vercel）
- `MONGODB_URI`: MongoDB Atlasの接続文字列
- `JWT_SECRET`: ランダムな文字列（例: `your-super-secret-jwt-key-here`）
- `CLIENT_URL`: フロントエンドのURL（例: `https://tech-bridge-frontend.vercel.app`）

## 🔄 デプロイフロー

```
GitHubにプッシュ
    ↓
GitHub Actionsが自動実行
    ↓
Vercelに自動デプロイ
    ↓
本番環境で動作
```

## 📚 参考リンク

- リポジトリ: https://github.com/YUZY742/tech-bridge
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/YUZY742/tech-bridge/actions
