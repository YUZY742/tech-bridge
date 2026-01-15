# TECH-BRIDGE テストガイド

## 🧪 テスト方法

### 自動テスト（推奨）

全機能を自動的にテストします：

```bash
./scripts/test-all-features.sh
```

このスクリプトは以下をテストします：
- ✅ ヘルスチェック
- ✅ APIエンドポイント（サンプルデータ取得）
- ✅ ユーザー登録・ログイン機能
- ✅ サークル作成・閲覧機能
- ✅ チャット機能

### 手動テスト

ブラウザでの動作確認手順は `scripts/test-manual.md` を参照してください。

## 📋 テスト項目

### 1. APIエンドポイントのテスト

#### ヘルスチェック
```bash
curl https://tech-bridge-uybw.vercel.app/api/health
```

**期待される結果:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T...",
  "database": {
    "status": "connected",
    "connected": true
  }
}
```

#### サークル一覧取得
```bash
curl https://tech-bridge-uybw.vercel.app/api/circles
```

**期待される結果:**
- サークルの配列が返る
- サンプルデータが4件以上存在する

#### サークル詳細取得
```bash
# サークルIDを置き換えてください
curl https://tech-bridge-uybw.vercel.app/api/circles/CIRCLE_ID
```

### 2. ユーザー登録・ログイン機能のテスト

#### ユーザー登録
```bash
curl -X POST https://tech-bridge-uybw.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "student",
    "profile": {
      "name": "Test User",
      "university": "Test University"
    }
  }'
```

**期待される結果:**
- `token`と`user`が返る
- ステータスコード: 201

#### ログイン
```bash
curl -X POST https://tech-bridge-uybw.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**期待される結果:**
- `token`と`user`が返る
- ステータスコード: 200

#### 認証済みエンドポイント
```bash
# ログインで取得したトークンを使用
TOKEN="your_token_here"
curl https://tech-bridge-uybw.vercel.app/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**期待される結果:**
- ユーザー情報が返る
- ステータスコード: 200

### 3. サークル作成・閲覧機能のテスト

#### サークル作成（認証が必要）
```bash
TOKEN="your_token_here"
curl -X POST https://tech-bridge-uybw.vercel.app/api/circles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "テストサークル",
    "description": "これはテスト用のサークルです",
    "university": "テスト大学",
    "category": "その他",
    "currentStatus": "テスト中"
  }'
```

**期待される結果:**
- 作成されたサークル情報が返る
- ステータスコード: 201

#### サークル一覧閲覧（認証不要）
```bash
curl https://tech-bridge-uybw.vercel.app/api/circles
```

### 4. チャット機能のテスト

チャット機能は支援（Support）が作成された後に利用可能です。

#### 支援申請の作成（企業ユーザーが必要）
```bash
TOKEN="company_user_token"
curl -X POST https://tech-bridge-uybw.vercel.app/api/supports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "circleId": "CIRCLE_ID",
    "supportType": "funding",
    "amount": 100000,
    "purpose": "テスト支援"
  }'
```

#### チャットメッセージの送信
```bash
TOKEN="your_token"
SUPPORT_ID="support_id"
curl -X POST https://tech-bridge-uybw.vercel.app/api/chat/$SUPPORT_ID/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "こんにちは、技術的な質問があります"
  }'
```

## 🎯 テストチェックリスト

### 基本機能
- [ ] フロントエンドが正常に表示される
- [ ] ヘルスチェックが正常に動作する
- [ ] サークル一覧が表示される
- [ ] サークル詳細が表示される

### 認証機能
- [ ] ユーザー登録が正常に動作する
- [ ] ログインが正常に動作する
- [ ] ログアウトが正常に動作する
- [ ] 認証済みエンドポイントが正常に動作する

### サークル機能
- [ ] サークル一覧が取得できる
- [ ] サークル詳細が取得できる
- [ ] サークル検索が動作する
- [ ] サークルフィルタリングが動作する
- [ ] サークル作成が動作する（認証済み）

### 企業機能
- [ ] 企業ダッシュボードが表示される
- [ ] サークル検索が動作する
- [ ] 支援申請が作成できる

### チャット機能
- [ ] チャットルームが作成される
- [ ] メッセージを送信できる
- [ ] メッセージを受信できる

## 🔧 トラブルシューティング

### APIが404を返す
- バックエンドが正しくデプロイされているか確認
- 環境変数が正しく設定されているか確認

### 認証エラー（401）
- トークンが正しく設定されているか確認
- トークンの有効期限を確認

### データベースエラー
- MongoDB接続が正常か確認: `/api/health`
- 環境変数`MONGODB_URI`が設定されているか確認

### サンプルデータが表示されない
- サンプルデータが投入されているか確認
- データベース接続が正常か確認

## 📚 参考

- **自動テスト**: `./scripts/test-all-features.sh`
- **手動テスト**: `scripts/test-manual.md`
- **セットアップ確認**: `./scripts/check-setup.sh`
