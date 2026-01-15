# ビルドエラー修正

## 問題

Vercelのビルドが「Creating an optimized production build...」の段階で失敗していました。

## 原因

`vercel.json`のビルド設定で、`client`ディレクトリに移動してから依存関係をインストール・ビルドする必要がありましたが、設定が不足していました。

## 修正内容

### 1. vercel.jsonの更新

`vercel.json`に以下を追加：
- `installCommand`: `cd client && npm install`
- `buildCommand`: `cd client && npm run build`

これにより、ルートディレクトリから`client`ディレクトリに移動してからビルドが実行されます。

### 2. client/vercel.jsonの削除

`client/vercel.json`を削除しました。ルートディレクトリの`vercel.json`で一元管理します。

## Vercel Dashboardの設定

以下の設定を確認してください：

**Settings → Build and Deployment**
- Root Directory: **空欄**（削除済み）
- Build Command: **空欄**（vercel.jsonで管理）
- Output Directory: **空欄**（vercel.jsonで管理）
- Install Command: **空欄**（vercel.jsonで管理）

**重要**: Vercel Dashboardの設定と`vercel.json`の設定が競合しないように、Dashboardの設定は空欄にしてください。`vercel.json`で一元管理します。

## 再デプロイ

1. 設定を確認
2. 「Redeploy」をクリック
3. ビルドログを確認

これでビルドが成功するはずです！
