# 手動テストガイド

## ブラウザでの動作確認

### 1. フロントエンドアクセス

https://tech-bridge-uybw.vercel.app にアクセス

**確認項目:**
- [ ] ホームページが正常に表示される
- [ ] ナビゲーションバーが表示される
- [ ] リンクが正常に動作する

### 2. ユーザー登録

1. 「登録」をクリック
2. 以下の情報を入力:
   - メールアドレス: `test@example.com`
   - パスワード: `TestPassword123!`
   - アカウントタイプ: 学生
   - 氏名: `テストユーザー`
   - 大学名: `テスト大学`
3. 「登録」をクリック

**確認項目:**
- [ ] 登録が成功する
- [ ] ホームページにリダイレクトされる
- [ ] ログイン状態が保持される

### 3. ログイン

1. 「ログアウト」をクリック（ログイン済みの場合）
2. 「ログイン」をクリック
3. 登録したメールアドレスとパスワードを入力
4. 「ログイン」をクリック

**確認項目:**
- [ ] ログインが成功する
- [ ] ホームページにリダイレクトされる
- [ ] ユーザー情報が表示される

### 4. サークル一覧

1. 「サークル一覧」をクリック
2. サークル一覧ページを確認

**確認項目:**
- [ ] サークル一覧が表示される
- [ ] 検索機能が動作する
- [ ] フィルタリングが動作する
- [ ] サークルカードをクリックすると詳細ページに遷移する

### 5. サークル詳細

1. サークル一覧から任意のサークルをクリック
2. サークル詳細ページを確認

**確認項目:**
- [ ] サークル情報が表示される
- [ ] 技術スタックが表示される
- [ ] 必要な支援が表示される
- [ ] 企業ユーザーの場合、「支援を申し込む」ボタンが表示される

### 6. 企業ダッシュボード（企業ユーザーでログイン）

1. 企業アカウントで登録・ログイン
2. 「ダッシュボード」をクリック

**確認項目:**
- [ ] ダッシュボードが表示される
- [ ] 統計情報が表示される
- [ ] おすすめのサークルが表示される

### 7. チャット機能（支援申請後）

1. 企業ユーザーでログイン
2. サークル詳細ページで「支援を申し込む」をクリック
3. 支援申請を作成
4. チャット機能を確認

**確認項目:**
- [ ] チャットルームが作成される
- [ ] メッセージを送信できる
- [ ] メッセージを受信できる

## API動作確認（curl）

### サークル一覧取得

```bash
curl https://tech-bridge-uybw.vercel.app/api/circles
```

### サークル詳細取得

```bash
# サークルIDを置き換えてください
curl https://tech-bridge-uybw.vercel.app/api/circles/CIRCLE_ID
```

### ユーザー登録

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

### ログイン

```bash
curl -X POST https://tech-bridge-uybw.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 認証済みエンドポイント（トークンが必要）

```bash
# ログインで取得したトークンを使用
curl https://tech-bridge-uybw.vercel.app/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 自動テスト

```bash
./scripts/test-all-features.sh
```

すべての機能を自動的にテストします。
