import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero">
        <h1>TECH-BRIDGE</h1>
        <p className="subtitle">理工系プロジェクト団体特化型リクルーティング・プラットフォーム</p>
        <p className="description">
          学生の「実証された能力」を、企業の「資本力」と「経験」で補完し、
          持続可能なイノベーションを生み出すための知財と人材のインキュベーション・インフラ
        </p>
        <div className="cta-buttons">
          <Link to="/circles" className="cta-button primary">サークルを探す</Link>
          <Link to="/register" className="cta-button secondary">登録する</Link>
        </div>
      </section>

      <section className="system-architecture">
        <h2>システムの基本構造</h2>
        <div className="architecture-content">
          <div className="architecture-description">
            <p>
              TECH-BRIDGEは、モダンなWebアーキテクチャを採用した3層構造のシステムです。
              各層が明確に分離され、拡張性と保守性を確保しています。
            </p>
          </div>
          <div className="architecture-layers">
            <div className="layer-card">
              <div className="layer-header">
                <h3>プレゼンテーション層</h3>
                <span className="layer-badge">フロントエンド</span>
              </div>
              <div className="layer-content">
                <p className="layer-description">利用者が操作する画面部分</p>
                <ul className="layer-tech">
                  <li>React 18（TypeScript）</li>
                  <li>React Router（ルーティング）</li>
                  <li>Axios（API通信）</li>
                  <li>Socket.io-client（リアルタイム通信）</li>
                </ul>
                <p className="layer-responsibility">
                  <strong>役割：</strong>ユーザーインターフェースの提供、入力データの検証、サーバーへのリクエスト送信
                </p>
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer-card">
              <div className="layer-header">
                <h3>アプリケーション層</h3>
                <span className="layer-badge">バックエンド</span>
              </div>
              <div className="layer-content">
                <p className="layer-description">ビジネスロジックとAPI処理</p>
                <ul className="layer-tech">
                  <li>Node.js + Express</li>
                  <li>JWT認証（セキュリティ）</li>
                  <li>Socket.io（リアルタイム通信）</li>
                  <li>RESTful API</li>
                </ul>
                <p className="layer-responsibility">
                  <strong>役割：</strong>認証・認可、データ加工、ビジネスルールの実装、フロントエンドとデータベース間の仲介
                </p>
              </div>
            </div>
            <div className="layer-arrow">↓</div>
            <div className="layer-card">
              <div className="layer-header">
                <h3>データ層</h3>
                <span className="layer-badge">データベース</span>
              </div>
              <div className="layer-content">
                <p className="layer-description">データの永続化と管理</p>
                <ul className="layer-tech">
                  <li>MongoDB Atlas（クラウドデータベース）</li>
                  <li>Mongoose（ODM）</li>
                  <li>データモデル：User, Circle, Company, Support</li>
                </ul>
                <p className="layer-responsibility">
                  <strong>役割：</strong>データの保存・取得、問い合わせ処理、データ整合性の維持
                </p>
              </div>
            </div>
          </div>
          <div className="architecture-infra">
            <h3>インフラ構成</h3>
            <div className="infra-grid">
              <div className="infra-item">
                <strong>ホスティング：</strong>Vercel（サーバーレス関数）
              </div>
              <div className="infra-item">
                <strong>CI/CD：</strong>GitHub Actions（自動デプロイ）
              </div>
              <div className="infra-item">
                <strong>バージョン管理：</strong>Git / GitHub
              </div>
              <div className="infra-item">
                <strong>環境変数管理：</strong>Vercel Dashboard
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>主な機能</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>技術ポートフォリオの可視化</h3>
            <p>GitHubリポジトリ、設計図面、実験データ、活動報告書などをアーカイブし、企業の技術者が直接その「質」を審査できます</p>
          </div>
          <div className="feature-card">
            <h3>企業側ダッシュボード</h3>
            <p>自社の技術基準に照らし合わせ、支援したいサークルを検索・フィルタリングできます</p>
          </div>
          <div className="feature-card">
            <h3>チャット機能</h3>
            <p>支援を決める前に、技術的な質問を投げかけたり、デモ会への招待を依頼したりできます</p>
          </div>
          <div className="feature-card">
            <h3>活動ログ管理</h3>
            <p>個人ごとの活動ログや成果物への寄与を記録し、フリーライダー問題を防止します</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
