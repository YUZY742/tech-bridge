# TECH-BRIDGE クイックスタートガイド

## 🚀 5分で始める

### ステップ1: 環境変数の生成

```bash
./scripts/generate-env.sh
```

生成されたJWT_SECRETをコピーしてください。

### ステップ2: MongoDB Atlasのセットアップ

1. https://www.mongodb.com/cloud/atlas にアクセス
2. 「Try Free」をクリックして無料アカウント作成
3. 「Build a Database」→「FREE」を選択
4. クラスター名を入力（例: `Cluster0`）
5. 「Create」をクリック
6. データベースユーザーを作成:
   - Username: `techbridge`
   - Password: 強力なパスワードを設定（メモしておく）
7. ネットワークアクセス:
   - 「Add IP Address」→「Allow Access from Anywhere」
   - 「Confirm」をクリック
8. 接続文字列を取得:
   - 「Connect」→「Connect your application」
   - 接続文字列をコピー（例: `mongodb+srv://techbridge:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`）
   - `<password>`を実際のパスワードに置き換える

### ステップ3: Vercelで環境変数を設定

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `tech-bridge-uybw`プロジェクトを開く
3. **Settings → Environment Variables** に移動
4. 以下を追加（Production環境）:

```
MONGODB_URI=mongodb+srv://techbridge:実際のパスワード@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=生成されたJWT_SECRET
CLIENT_URL=https://tech-bridge-uybw.vercel.app
REACT_APP_API_URL=https://tech-bridge-uybw.vercel.app
NODE_ENV=production
```

5. 「Save」をクリック
6. 「Deployments」タブで「Redeploy」をクリック

### ステップ4: 動作確認

```bash
./scripts/test-api.sh
```

または、ブラウザで以下にアクセス:
- https://tech-bridge-uybw.vercel.app

## ✅ 完了！

これでTECH-BRIDGEが完全に動作します！

## 📚 詳細情報

- 環境変数設定: `ENV_SETUP.md`
- 次のアクション: `NEXT_ACTIONS.md`
- トラブルシューティング: `README.md`
