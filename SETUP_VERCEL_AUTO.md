# Vercel自動デプロイ完全ガイド

## 🎯 目標

GitHubにプッシュするだけで、自動的にVercelにデプロイされるように設定します。

## ✅ 現在の状態

- ✅ GitHubリポジトリ作成済み: https://github.com/YUZY742/tech-bridge
- ✅ GitHub Actionsワークフロー設定済み
- ⏳ VercelトークンとプロジェクトIDの設定が必要

## 🚀 自動デプロイを有効化する2つの方法

### 方法1: Vercel Web UIで自動デプロイ（最も簡単・推奨）

この方法なら、**一度設定するだけで、GitHubにプッシュするたびに自動でデプロイされます！**

#### ステップ1: Vercelにログイン

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」→「Continue with GitHub」でログイン
3. GitHubアカウントへのアクセスを許可

#### ステップ2: フロントエンドをデプロイ

1. 「Add New Project」をクリック
2. `tech-bridge`リポジトリを選択
3. プロジェクト設定:
   - **Project Name**: `tech-bridge-frontend`
   - **Root Directory**: `client`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. 環境変数を追加:
   - `REACT_APP_API_URL`: `https://tech-bridge-backend.vercel.app`（後で更新）
5. 「Deploy」をクリック

**これで完了！GitHubにプッシュするたびに自動デプロイされます！**

#### ステップ3: バックエンドをデプロイ

1. 再度「Add New Project」をクリック
2. 同じ`tech-bridge`リポジトリを選択
3. プロジェクト設定:
   - **Project Name**: `tech-bridge-backend`
   - **Root Directory**: `server`
   - **Framework Preset**: Other
   - **Build Command**: （空欄）
   - **Output Directory**: （空欄）
4. 環境変数を追加:
   - `MONGODB_URI`: MongoDB Atlasの接続文字列
   - `JWT_SECRET`: ランダムな文字列（例: `your-super-secret-jwt-key-here`）
   - `CLIENT_URL`: フロントエンドのURL（例: `https://tech-bridge-frontend.vercel.app`）
5. 「Deploy」をクリック

#### ステップ4: フロントエンドの環境変数を更新

1. フロントエンドプロジェクトのSettings → Environment Variables
2. `REACT_APP_API_URL`をバックエンドのURLに更新
3. 「Redeploy」をクリック

### 方法2: GitHub Actionsで自動デプロイ（高度）

GitHub Actionsを使った自動デプロイを有効化するには、Vercelトークンが必要です。

#### ステップ1: Vercelトークンを取得

1. [Vercel Dashboard](https://vercel.com/account/tokens)にアクセス
2. 「Create Token」をクリック
3. トークン名: `github-actions-deploy`
4. スコープ: Full Account
5. 「Create」をクリックしてトークンをコピー

#### ステップ2: Vercel組織IDとプロジェクトIDを取得

1. Vercelでプロジェクトを作成（方法1のステップ2と3を先に実行）
2. プロジェクトのSettings → General
3. 以下をコピー:
   - **Project ID**: プロジェクトID
   - **Team ID**: 組織ID（Settings → General → Team ID）

#### ステップ3: GitHub Secretsを設定

1. GitHubリポジトリ: https://github.com/YUZY742/tech-bridge
2. Settings → Secrets and variables → Actions
3. 「New repository secret」をクリックして以下を追加:

```
VERCEL_TOKEN: （ステップ1で取得したトークン）
VERCEL_ORG_ID: （ステップ2で取得したTeam ID）
VERCEL_PROJECT_ID: （フロントエンドのProject ID）
VERCEL_PROJECT_ID_BACKEND: （バックエンドのProject ID）
REACT_APP_API_URL: https://tech-bridge-backend.vercel.app
MONGODB_URI: （MongoDB Atlasの接続文字列）
JWT_SECRET: （ランダムな文字列）
CLIENT_URL: https://tech-bridge-frontend.vercel.app
```

#### ステップ4: 自動デプロイの確認

1. GitHubに何か変更をプッシュ
2. Actionsタブでワークフローの実行を確認
3. 成功するとVercelに自動デプロイされます

## 📋 デプロイフロー

```
コードを変更
    ↓
GitHubにプッシュ
    ↓
Vercelが自動検知（方法1）またはGitHub Actionsが実行（方法2）
    ↓
自動ビルド
    ↓
Vercelにデプロイ
    ↓
本番環境で動作
```

## 🔧 トラブルシューティング

### デプロイが失敗する

- ビルドログを確認（Vercel Dashboard → Deployments → 該当デプロイ）
- 環境変数が正しく設定されているか確認
- `package.json`の依存関係が正しいか確認

### 環境変数が反映されない

- 環境変数を設定後、再デプロイが必要
- 変数名が正しいか確認（特に`REACT_APP_`プレフィックス）

### CORSエラー

- バックエンドの`CLIENT_URL`環境変数がフロントエンドのURLと一致しているか確認

## 📚 参考リンク

- リポジトリ: https://github.com/YUZY742/tech-bridge
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/YUZY742/tech-bridge/actions

## 💡 推奨

**方法1（Vercel Web UI）を推奨します。** 最も簡単で、一度設定すれば完全自動です！
