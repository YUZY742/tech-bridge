# 残りのタスク完了ガイド

## 📋 残りのタスク

### ✅ 自動化済み

- ✅ 環境変数生成スクリプト
- ✅ サンプルデータ投入スクリプト
- ✅ API動作確認スクリプト
- ✅ セットアップ状況確認スクリプト

### ⚠️ 手動で実行が必要

以下のタスクは手動で実行する必要があります：

## 1. MongoDB Atlasのセットアップ

### クイックセットアップ（約5分）

1. **アカウント作成**
   - https://www.mongodb.com/cloud/atlas にアクセス
   - 「Try Free」をクリック
   - Googleアカウントまたはメールアドレスで登録

2. **クラスター作成**
   - 「Build a Database」→「FREE」を選択
   - クラスター名を入力（例: `Cluster0`）
   - リージョンを選択（最寄りを推奨）
   - 「Create」をクリック（2-3分かかります）

3. **データベースユーザー作成**
   - 「Database Access」→「Add New Database User」
   - Authentication Method: Password
   - Username: `techbridge`
   - Password: 強力なパスワードを設定（**メモしておく**）
   - Database User Privileges: 「Read and write to any database」
   - 「Add User」をクリック

4. **ネットワークアクセス設定**
   - 「Network Access」→「Add IP Address」
   - 「Allow Access from Anywhere」をクリック（0.0.0.0/0）
   - 「Confirm」をクリック

5. **接続文字列の取得**
   - 「Connect」→「Connect your application」
   - Driver: Node.js
   - Version: 5.5 or later
   - 接続文字列をコピー（例: `mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`）
   - **重要**: `<password>`を実際のパスワードに置き換える

## 2. Vercelで環境変数を設定

### 手順

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `tech-bridge-uybw`プロジェクトを開く
3. **Settings → Environment Variables** に移動
4. 以下を追加（**Production環境**を選択）:

```
MONGODB_URI=mongodb+srv://techbridge:実際のパスワード@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=vJf68vDpVL+nk4gj+onuFSUfE7Tw/hp2y6spH1p6ujY=
CLIENT_URL=https://tech-bridge-uybw.vercel.app
REACT_APP_API_URL=https://tech-bridge-uybw.vercel.app
NODE_ENV=production
```

5. 各環境変数を追加後、「Save」をクリック
6. **「Deployments」タブに移動**
7. 最新のデプロイメントで「Redeploy」をクリック

## 3. サンプルデータの投入

### 方法1: ローカルから実行（推奨）

```bash
# 環境変数を設定
export MONGODB_URI=mongodb+srv://techbridge:パスワード@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# サンプルデータを投入
cd server
npm run seed
```

### 方法2: Vercel CLIを使用

```bash
# Vercel CLIでログイン
vercel login

# 環境変数を設定
vercel env add MONGODB_URI production

# シードスクリプトを実行（Vercel Functions経由）
# または、ローカルから実行
```

### 方法3: MongoDB AtlasのWeb UIから

1. MongoDB Atlas Dashboardにアクセス
2. 「Browse Collections」をクリック
3. データベース `tech-bridge` を作成
4. コレクション `circles` を作成
5. 「Insert Document」で手動でデータを追加

## 4. 動作確認

### 自動確認

```bash
./scripts/check-setup.sh
```

### 手動確認

```bash
# ヘルスチェック
curl https://tech-bridge-uybw.vercel.app/api/health

# サークル一覧
curl https://tech-bridge-uybw.vercel.app/api/circles

# フロントエンド
open https://tech-bridge-uybw.vercel.app
```

## 🎯 完了チェックリスト

- [ ] MongoDB Atlasアカウント作成
- [ ] クラスター作成
- [ ] データベースユーザー作成
- [ ] ネットワークアクセス設定
- [ ] 接続文字列取得
- [ ] VercelでMONGODB_URI設定
- [ ] VercelでJWT_SECRET設定
- [ ] VercelでCLIENT_URL設定
- [ ] VercelでREACT_APP_API_URL設定
- [ ] Vercelで再デプロイ
- [ ] サンプルデータ投入
- [ ] 動作確認

## 📚 参考リンク

- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Vercel Dashboard**: https://vercel.com/dashboard
- **クイックスタート**: `QUICK_START.md`
- **環境変数設定**: `ENV_SETUP.md`

## 💡 トラブルシューティング

### MongoDB接続エラー

- ネットワークアクセスで`0.0.0.0/0`が許可されているか確認
- 接続文字列のパスワードが正しいか確認
- クラスターが完全に作成されているか確認（2-3分かかります）

### 環境変数が反映されない

- Production環境に設定されているか確認
- 環境変数設定後、必ず「Redeploy」を実行
- 変数名が正しいか確認（大文字小文字に注意）

### サンプルデータが投入できない

- MongoDB接続が正常か確認: `curl https://tech-bridge-uybw.vercel.app/api/health`
- ローカルから実行する場合は、MONGODB_URI環境変数が設定されているか確認
