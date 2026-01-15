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
