# 次のステップ - 本番環境の完成

## ✅ 完了した作業

- ✅ フロントエンドのデプロイ完了（tech-bridge-uybw）
- ✅ API URLの環境変数対応
- ✅ バックエンドのVercel設定ファイル作成

## 🚀 次のステップ

### 1. バックエンドのデプロイ

Vercelでバックエンドもデプロイする必要があります：

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New Project」をクリック
3. `tech-bridge`リポジトリを選択
4. プロジェクト設定:
   - **Project Name**: `tech-bridge-backend`
   - **Root Directory**: `server`
   - **Framework Preset**: Other
   - **Build Command**: （空欄）
   - **Output Directory**: （空欄）
5. 環境変数を設定（重要！）:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key
   CLIENT_URL=https://tech-bridge-uybw.vercel.app
   NODE_ENV=production
   ```
6. 「Deploy」をクリック

### 2. フロントエンドの環境変数更新

バックエンドがデプロイされたら、フロントエンドの環境変数を更新：

1. フロントエンドプロジェクトのSettings → Environment Variables
2. `REACT_APP_API_URL`をバックエンドのURLに更新:
   ```
   REACT_APP_API_URL=https://tech-bridge-backend.vercel.app
   ```
3. 「Redeploy」をクリック

### 3. MongoDB Atlasの設定

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)にアクセス
2. 無料アカウントを作成（まだの場合）
3. クラスターを作成
4. データベースユーザーを作成:
   - Username: `techbridge`
   - Password: 強力なパスワードを設定
5. ネットワークアクセスを設定:
   - 「Add IP Address」→「Allow Access from Anywhere」（0.0.0.0/0）
6. 「Connect」→「Connect your application」をクリック
7. 接続文字列をコピー（例: `mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`）
8. パスワードを実際のパスワードに置き換えて、Vercelの環境変数に設定

### 4. 動作確認

1. フロントエンドにアクセス
2. ユーザー登録をテスト
3. ログインをテスト
4. サークル一覧が表示されるか確認
5. API接続が正常に動作するか確認

## 📋 環境変数チェックリスト

### フロントエンド（Vercel）
- [ ] `REACT_APP_API_URL`: バックエンドのURL

### バックエンド（Vercel）
- [ ] `MONGODB_URI`: MongoDB Atlasの接続文字列
- [ ] `JWT_SECRET`: ランダムな文字列（例: `your-super-secret-jwt-key-here`）
- [ ] `CLIENT_URL`: フロントエンドのURL
- [ ] `NODE_ENV`: `production`

## 🔧 トラブルシューティング

### CORSエラーが発生する
- バックエンドの`CLIENT_URL`環境変数がフロントエンドのURLと一致しているか確認
- 環境変数を設定後、再デプロイが必要

### データベース接続エラー
- MongoDB Atlasのネットワークアクセスで`0.0.0.0/0`が許可されているか確認
- 接続文字列のパスワードが正しいか確認

### APIが404エラー
- バックエンドのURLが正しいか確認
- フロントエンドの`REACT_APP_API_URL`が正しく設定されているか確認

## 📚 参考リンク

- リポジトリ: https://github.com/YUZY742/tech-bridge
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
