# トラブルシューティングガイド

## 🔍 現在の問題: MongoDB接続タイムアウト

### 症状
- エラー: `Operation circles.find() buffering timed out after 10000ms`
- ヘルスチェック: `"database": {"status": "disconnected", "connected": false}`

### 考えられる原因と解決方法

## 1. 環境変数が正しく設定されていない

### 確認方法

Vercel Dashboardで以下を確認:
1. Settings → Environment Variables
2. 以下の環境変数が**Production環境**に設定されているか確認:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `REACT_APP_API_URL`

### 解決方法

1. 環境変数を**Production環境**に設定
2. 設定後、**必ず「Redeploy」をクリック**
3. 再デプロイが完了するまで待つ（1-2分）

## 2. MongoDB Atlasの接続文字列が間違っている

### 確認項目

- 接続文字列の形式が正しいか:
  ```
  mongodb+srv://techbridge:パスワード@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- パスワードに特殊文字が含まれている場合、URLエンコードが必要
- 接続文字列に`<password>`が残っていないか確認

### 解決方法

1. MongoDB Atlasで接続文字列を再取得
2. パスワードを実際のパスワードに置き換え
3. 特殊文字がある場合はURLエンコード
4. Vercelで環境変数を更新
5. 再デプロイ

## 3. MongoDB Atlasのネットワークアクセスが許可されていない

### 確認方法

MongoDB Atlas Dashboard:
1. 「Network Access」に移動
2. IPアドレスのリストを確認
3. `0.0.0.0/0` または VercelのIPアドレスが許可されているか確認

### 解決方法

1. 「Add IP Address」をクリック
2. 「Allow Access from Anywhere」を選択（0.0.0.0/0）
3. 「Confirm」をクリック
4. 数分待ってから再テスト

## 4. MongoDB Atlasのクラスターが完全に作成されていない

### 確認方法

MongoDB Atlas Dashboard:
1. クラスターの状態を確認
2. 「Creating...」と表示されている場合は完了を待つ

### 解決方法

- クラスターの作成が完了するまで待つ（通常2-3分）

## 5. 環境変数が反映されていない

### 確認方法

Vercel Dashboard:
1. 最新のデプロイメントを確認
2. デプロイメントログで環境変数が読み込まれているか確認

### 解決方法

1. 環境変数を設定後、**必ず再デプロイ**
2. デプロイメントログでエラーがないか確認
3. 環境変数の値が正しいか再確認

## 🔧 デバッグ手順

### ステップ1: ヘルスチェックで確認

```bash
curl https://tech-bridge-uybw.vercel.app/api/health | jq '.database'
```

**期待される結果:**
```json
{
  "status": "connected",
  "connected": true
}
```

### ステップ2: Vercelのデプロイメントログを確認

1. Vercel Dashboard → Deployments
2. 最新のデプロイメントをクリック
3. 「Build Logs」を確認
4. エラーメッセージを確認

### ステップ3: MongoDB Atlasの接続テスト

MongoDB Atlas Dashboard:
1. 「Connect」→「Connect your application」
2. 接続文字列をコピー
3. ローカルでテスト:
   ```bash
   export MONGODB_URI="your_connection_string"
   cd server
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(err => console.error('Error:', err))"
   ```

## 📋 チェックリスト

- [ ] MongoDB Atlasアカウントが作成されている
- [ ] クラスターが完全に作成されている（Creating...ではない）
- [ ] データベースユーザーが作成されている
- [ ] ネットワークアクセスで0.0.0.0/0が許可されている
- [ ] 接続文字列のパスワードが正しく置き換えられている
- [ ] VercelでMONGODB_URI環境変数がProduction環境に設定されている
- [ ] 環境変数設定後、再デプロイが実行されている
- [ ] デプロイメントログにエラーがない

## 💡 クイックフィックス

### 環境変数を再設定

1. Vercel Dashboard → Settings → Environment Variables
2. `MONGODB_URI`を削除
3. 正しい接続文字列で再追加
4. 「Redeploy」をクリック

### MongoDB接続文字列の再取得

1. MongoDB Atlas → Connect → Connect your application
2. 接続文字列をコピー
3. パスワードを実際のパスワードに置き換え
4. Vercelで環境変数を更新
5. 再デプロイ

## 🆘 まだ解決しない場合

1. Vercelのデプロイメントログを確認
2. MongoDB Atlasの接続ログを確認
3. 接続文字列を再生成
4. 新しいデータベースユーザーを作成して試す
