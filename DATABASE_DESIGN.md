# TECH-BRIDGE データベース設計

## 概要

TECH-BRIDGEのデータベースは、MongoDBを使用し、将来のデータ活用を考慮した設計になっています。

## データモデル

### 1. User（ユーザー）

**用途**: 学生、企業、管理者のアカウント情報

**主要フィールド**:
- `email`: メールアドレス（ユニーク）
- `password`: ハッシュ化されたパスワード
- `role`: ロール（student, company, admin）
- `profile`: プロファイル情報（名前、大学、企業名など）
- `createdAt`, `updatedAt`: タイムスタンプ

**インデックス**:
- `role + createdAt`: ロール別の時系列分析用
- `profile.university`: 大学別分析用

**データ活用**:
- ユーザー登録数の推移分析
- 大学別のユーザー分布
- ロール別の統計

### 2. Circle（サークル）

**用途**: サークルの基本情報、メンバー、活動ログ、ポートフォリオ

**主要フィールド**:
- `name`, `description`: 基本情報
- `university`, `category`, `region`: 分類情報
- `techStack`: 技術スタック（言語、CAD、機材など）
- `portfolio`: ポートフォリオ（GitHub、設計図面、実験データなど）
- `members`: メンバー情報（ユーザーID、役割、貢献リスト）
- `activityLogs`: 活動ログ（ユーザーID、活動内容、貢献、日付）
- `supporters`: 支援者情報（企業ID、支援タイプ、金額、ステータス）
- `isRookie`: 新規サークルフラグ

**インデックス**:
- テキスト検索: `name, description, category, tags`
- 分類検索: `university, region, category`
- 時系列分析: `createdAt`
- メンバー検索: `members.userId`
- 活動ログ分析: `activityLogs.date`
- 支援状況分析: `supporters.status, supporters.createdAt`
- 新規サークル分析: `isRookie, createdAt`

**データ活用**:
- カテゴリ別・地域別のサークル分布
- 活動ログの時系列分析
- メンバーの貢献度分析
- 支援状況の分析
- 新規サークルの成長分析

### 3. Company（企業）

**用途**: 企業のプロファイル、予算、支援履歴

**主要フィールド**:
- `userId`: ユーザーID（参照）
- `companyName`, `industry`: 基本情報
- `techFocus`: 技術フォーカス領域
- `budgetCategories`: 予算カテゴリ（採用、R&D、教育）
- `kpis`: KPI（インターン応募数、採用率など）
- `supportedCircles`: 支援したサークル一覧

**インデックス**:
- `industry`: 業界別分析用
- `supportedCircles.status`: 支援状況分析用
- `createdAt`: 時系列分析用

**データ活用**:
- 業界別の支援傾向分析
- 予算使用状況の分析
- KPIの追跡
- 支援サークルの成果分析

### 4. Support（支援）

**用途**: 企業からサークルへの支援情報

**主要フィールド**:
- `companyId`, `circleId`: 参照
- `supportType`: 支援タイプ（funding, equipment, mentorship, software）
- `amount`: 金額
- `items`: 機材リスト
- `status`: ステータス（pending, approved, disbursed, completed, cancelled）
- `messages`: チャットメッセージ
- `activityLogs`: 支援関連の活動ログ

**インデックス**:
- `companyId + circleId`: 企業-サークル関係の検索
- `status + createdAt`: ステータス別の時系列分析
- `supportType + status`: 支援タイプ別分析
- `amount + createdAt`: 金額分析
- `activityLogs.date`: 活動ログ分析
- `createdAt`: 時系列分析

**データ活用**:
- 支援タイプ別の統計
- 支援金額の分析
- 支援ステータスの推移
- 企業別の支援傾向
- サークル別の支援受領状況

## データ活用のための設計

### 1. インデックスの最適化

すべてのモデルに、以下の用途でインデックスを設定：

- **検索用**: 頻繁に検索されるフィールド
- **時系列分析用**: `createdAt`, `updatedAt`, `date`フィールド
- **集計用**: カテゴリ、ステータス、タイプなどの分類フィールド
- **関係性検索用**: 参照フィールド（userId, companyId, circleId）

### 2. 集計クエリの最適化

`/api/analytics`エンドポイントで以下の集計を提供：

- プラットフォーム全体の統計
- 評価スコア分布
- 企業別の支援統計
- カテゴリ別・地域別の分布
- 時系列データ（月別登録数など）

### 3. データ構造の工夫

- **配列フィールド**: 活動ログ、貢献リストなどは配列として保存し、柔軟な分析を可能に
- **ネストされたオブジェクト**: ポートフォリオ、技術スタックなどは構造化されたオブジェクトとして保存
- **タイムスタンプ**: すべての重要なイベントにタイムスタンプを付与

## 将来の拡張

### 1. データウェアハウス連携

- MongoDBから定期的にデータをエクスポート
- データウェアハウス（BigQuery、Redshiftなど）に投入
- より高度な分析を実行

### 2. リアルタイム分析

- MongoDB Change Streamsを使用
- リアルタイムでダッシュボードを更新
- 異常検知やアラート機能

### 3. 機械学習

- 評価スコアの予測モデル
- マッチングアルゴリズム
- 異常検知

### 4. データエクスポート機能

- CSV/JSON形式でのエクスポート
- 企業向けのレポート生成
- 学生向けの活動履歴エクスポート

## パフォーマンス最適化

### 1. インデックスの定期メンテナンス

```javascript
// インデックスの使用状況を確認
db.circles.getIndexes()
db.circles.aggregate([{ $indexStats: {} }])
```

### 2. クエリの最適化

- 必要なフィールドのみ取得（projection）
- ページネーションの実装
- 集計クエリのキャッシュ

### 3. データのアーカイブ

- 古いデータのアーカイブ
- アクティブデータとアーカイブデータの分離

## セキュリティ

- パスワードのハッシュ化（bcrypt）
- 認証トークン（JWT）
- ロールベースのアクセス制御
- データの暗号化（MongoDB Atlasの暗号化機能）

## バックアップと復旧

- MongoDB Atlasの自動バックアップ
- 定期的なバックアップの確認
- 災害復旧計画の策定
