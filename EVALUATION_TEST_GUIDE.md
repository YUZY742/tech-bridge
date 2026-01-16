# 評価システムテストガイド

## 概要

評価システムが正しく動作するかテストするためのガイドです。

## テストデータの投入

### 1. 評価テスト用サンプルデータの作成

```bash
cd server
npm run seed:evaluation
```

このスクリプトは以下のデータを作成します：

- **高評価学生** (`highscore@example.com`)
  - 31件の活動ログ（過去180日間）
  - 8件の詳細な貢献記録
  - 充実したポートフォリオ（GitHub 3件、設計図面 2件、実験データ 2件、活動報告書 1件）
  - 多様な技術スタック（言語4種類、CAD 3種類）
  - 企業からの支援1件（承認済み）
  - **期待スコア**: 総合80点以上

- **中評価学生** (`mediumscore@example.com`)
  - 8件の活動ログ（過去90日間）
  - 3件の貢献記録
  - 基本的なポートフォリオ（GitHub 1件、設計図面 1件）
  - 基本的な技術スタック（言語2種類、CAD 1種類）
  - **期待スコア**: 総合50-70点

- **低評価学生** (`lowscore@example.com`)
  - 2件の活動ログ（過去30日間）
  - 1件の貢献記録
  - ポートフォリオなし
  - 最小限の技術スタック（言語1種類）
  - **期待スコア**: 総合40点以下

- **企業ユーザー** (`company1@example.com`)
  - 2つのサークルに支援

## テスト手順

### 1. サンプルデータの投入

```bash
cd server
npm run seed:evaluation
```

### 2. 評価システムのテスト

#### 方法1: テストスクリプトを使用

```bash
./scripts/test-evaluation.sh
```

このスクリプトは以下を実行します：
- 各学生でログイン
- 評価スコアを取得
- 期待値と比較
- スコアの順序を確認

#### 方法2: 手動テスト

1. **高評価学生でログイン**
   ```
   Email: highscore@example.com
   Password: password123
   ```

2. **学生ダッシュボードにアクセス**
   - `/student/dashboard` にアクセス
   - 評価スコアセクションを確認
   - 期待値: 総合80点以上

3. **中評価学生でログイン**
   ```
   Email: mediumscore@example.com
   Password: password123
   ```
   - 期待値: 総合50-70点

4. **低評価学生でログイン**
   ```
   Email: lowscore@example.com
   Password: password123
   ```
   - 期待値: 総合40点以下

### 3. API経由でのテスト

```bash
# 高評価学生でログイン
TOKEN=$(curl -k -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"highscore@example.com","password":"password123"}' \
  https://tech-bridge-uybw.vercel.app/api/auth/login | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 評価スコアを取得
curl -k -s \
  -H "Authorization: Bearer $TOKEN" \
  https://tech-bridge-uybw.vercel.app/api/students/evaluation | \
  python3 -m json.tool
```

## 期待される結果

### 高評価学生

```json
{
  "overallScore": 80以上,
  "technicalScore": 70以上,
  "gritScore": 80以上,
  "contributionScore": 70以上,
  "metrics": {
    "totalContributions": 8,
    "totalActivities": 31,
    "totalPortfolioItems": 8,
    "activeDays": 30以上,
    "techStackCount": 7以上,
    "projectDuration": 6ヶ月以上
  }
}
```

### 中評価学生

```json
{
  "overallScore": 50-70,
  "technicalScore": 40-60,
  "gritScore": 40-60,
  "contributionScore": 30-50,
  "metrics": {
    "totalContributions": 3,
    "totalActivities": 8,
    "totalPortfolioItems": 2,
    "activeDays": 8,
    "techStackCount": 3,
    "projectDuration": 3ヶ月
  }
}
```

### 低評価学生

```json
{
  "overallScore": 40以下,
  "technicalScore": 20以下,
  "gritScore": 20以下,
  "contributionScore": 10以下,
  "metrics": {
    "totalContributions": 1,
    "totalActivities": 2,
    "totalPortfolioItems": 0,
    "activeDays": 2,
    "techStackCount": 1,
    "projectDuration": 1ヶ月未満
  }
}
```

## スコア計算の確認

### 技術力スコア（40%）

```
技術力 = min(100, 
  min(30, ポートフォリオ項目数 × 5) +
  min(20, 技術スタック種類数 × 4) +
  min(25, 貢献数 × 2)
)
```

### 継続性スコア（35%）

```
継続性 = min(100,
  min(40, 活動日数 × 2) +
  min(30, 継続期間（月） × 10) +
  min(30, 活動頻度（回/日） × 5)
)
```

### 貢献度スコア（25%）

```
貢献度 = min(100,
  min(50, 総貢献数 × 5) +
  min(30, 詳細貢献数 × 3) +
  min(20, 受けた支援数 × 2)
)
```

### 総合スコア

```
総合 = 技術力 × 0.4 + 継続性 × 0.35 + 貢献度 × 0.25
```

## トラブルシューティング

### データが投入されない

1. MongoDB接続を確認
   ```bash
   curl https://tech-bridge-uybw.vercel.app/api/health
   ```

2. 環境変数を確認
   - `MONGODB_URI`が正しく設定されているか

3. スクリプトを直接実行
   ```bash
   cd server
   node scripts/seed-evaluation.js
   ```

### スコアが期待と異なる

1. データが正しく投入されているか確認
   ```bash
   # サークル数を確認
   curl https://tech-bridge-uybw.vercel.app/api/circles
   ```

2. 活動ログが正しく記録されているか確認
   - 学生ダッシュボードで活動ログを確認

3. ポートフォリオが正しく記録されているか確認
   - サークル詳細ページでポートフォリオを確認

## データ分析エンドポイント

評価システムのテスト後、以下のエンドポイントでデータ分析も確認できます：

### プラットフォーム統計（管理者用）

```bash
curl -k -s \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://tech-bridge-uybw.vercel.app/api/analytics/platform | \
  python3 -m json.tool
```

### 評価スコア分布

```bash
curl -k -s \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  https://tech-bridge-uybw.vercel.app/api/analytics/evaluation-distribution | \
  python3 -m json.tool
```

## 次のステップ

1. ✅ サンプルデータの投入
2. ✅ 評価システムのテスト
3. ⏳ 実際の学生データでの検証
4. ⏳ 評価基準の調整（必要に応じて）
