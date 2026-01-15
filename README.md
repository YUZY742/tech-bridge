# TECH-BRIDGE

理工系プロジェクト団体特化型リクルーティング・プラットフォーム

## 概要

TECH-BRIDGEは、学生の「実証された能力」を、企業の「資本力」と「経験」で補完し、持続可能なイノベーションを生み出すための知財と人材のインキュベーション・インフラです。

## 主な機能

- **技術ポートフォリオの可視化**: GitHubリポジトリ、設計図面、実験データ、活動報告書などをアーカイブ
- **企業側ダッシュボード**: 自社の技術基準に照らし合わせ、支援したいサークルを検索・フィルタリング
- **チャット機能**: 支援を決める前に、技術的な質問を投げかけたり、デモ会への招待を依頼
- **活動ログ管理**: 個人ごとの活動ログや成果物への寄与を記録

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- React Router
- Axios

### バックエンド
- Node.js
- Express
- MongoDB (Mongoose)
- Socket.io (リアルタイムチャット)
- JWT認証

## セットアップ

### 前提条件
- Node.js (v16以上)
- MongoDB (ローカルまたはMongoDB Atlas)

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd TechTech
```

2. 依存関係をインストール
```bash
npm run install-all
```

3. 環境変数を設定
```bash
cd server
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

4. MongoDBを起動（ローカルの場合）
```bash
mongod
```

5. 開発サーバーを起動
```bash
# ルートディレクトリから
npm run dev
```

これで以下が起動します：
- バックエンド: http://localhost:5000
- フロントエンド: http://localhost:3000

## プロジェクト構造

```
TechTech/
├── client/          # React フロントエンド
│   ├── src/
│   │   ├── components/   # 再利用可能なコンポーネント
│   │   ├── contexts/      # React Context
│   │   ├── pages/         # ページコンポーネント
│   │   └── App.tsx
│   └── package.json
├── server/           # Node.js バックエンド
│   ├── models/       # MongoDB モデル
│   ├── routes/       # API ルート
│   ├── index.js      # エントリーポイント
│   └── package.json
└── package.json      # ルート package.json
```

## API エンドポイント

### 認証
- `POST /api/auth/register` - 新規登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得

### サークル
- `GET /api/circles` - サークル一覧取得（フィルタリング対応）
- `GET /api/circles/:id` - サークル詳細取得
- `POST /api/circles` - サークル作成
- `PUT /api/circles/:id` - サークル更新

### 企業
- `GET /api/companies/dashboard` - 企業ダッシュボード
- `POST /api/companies/search` - サークル検索

### 支援
- `POST /api/supports` - 支援申請
- `GET /api/supports/company` - 企業の支援一覧
- `GET /api/supports/circle/:circleId` - サークルの支援一覧

### チャット
- `GET /api/chat/:supportId` - チャット履歴取得
- `POST /api/chat/:supportId/message` - メッセージ送信

## 開発

### バックエンドのみ起動
```bash
cd server
npm run dev
```

### フロントエンドのみ起動
```bash
cd client
npm start
```

## デプロイ

GitHubへのデプロイ手順は [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md) を参照してください。

### クイックデプロイ（Vercel推奨）

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)でGitHubリポジトリをインポート
3. 環境変数を設定
4. デプロイ完了

詳細は [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md) を参照してください。

## ライセンス

MIT
