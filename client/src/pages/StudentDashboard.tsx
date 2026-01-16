import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import './StudentDashboard.css';

interface Circle {
  _id: string;
  name: string;
  description: string;
  university: string;
  category: string;
  members: Array<{
    userId: string;
    role: string;
    contributions: string[];
  }>;
  supporters: Array<{
    companyId: string;
    supportType: string;
    status: string;
  }>;
  activityLogs: Array<{
    userId: string;
    activity: string;
    contribution: string;
    date: string;
  }>;
}

interface Activity {
  circleId: string;
  circleName: string;
  activity: string;
  contribution: string;
  date: string;
}

interface Support {
  _id: string;
  circleId: {
    _id: string;
    name: string;
  };
  companyId: {
    companyName: string;
  };
  supportType: string;
  status: string;
  amount: number;
}

interface DashboardData {
  stats: {
    totalCircles: number;
    totalSupports: number;
    activeSupports: number;
  };
  myCircles: Circle[];
  recentSupports: Support[];
  recentActivities: Activity[];
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluationScore, setEvaluationScore] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchDashboard();
      calculateEvaluationScore();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/students/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEvaluationScore = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/students/evaluation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvaluationScore(response.data);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (!dashboard) {
    return <div className="error">ダッシュボードの読み込みに失敗しました</div>;
  }

  // 貢献度の計算
  const totalContributions = dashboard.myCircles.reduce((sum, circle) => {
    const member = circle.members.find(m => m.userId === user?.id);
    return sum + (member?.contributions?.length || 0);
  }, 0);

  const totalActivities = dashboard.recentActivities.length;
  const activeDays = new Set(
    dashboard.recentActivities.map(a => new Date(a.date).toDateString())
  ).size;

  return (
    <div className="dashboard student-dashboard">
      <div className="dashboard-header">
        <h1>学生ダッシュボード</h1>
        <p className="welcome-message">
          こんにちは、<strong>{user?.profile?.name || user?.email}</strong>さん
        </p>
      </div>

      {/* 評価スコアセクション */}
      {evaluationScore && (
        <section className="evaluation-section">
          <h2>あなたの評価スコア</h2>
          <div className="evaluation-grid">
            <div className="evaluation-card overall">
              <h3>総合評価</h3>
              <div className="score-circle">
                <span className="score-value">{evaluationScore.overallScore}</span>
                <span className="score-max">/100</span>
              </div>
              <p className="score-description">{evaluationScore.overallDescription}</p>
            </div>
            <div className="evaluation-card">
              <h3>技術力</h3>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${evaluationScore.technicalScore}%` }}
                >
                  {evaluationScore.technicalScore}%
                </div>
              </div>
              <p className="score-detail">{evaluationScore.technicalDetails}</p>
            </div>
            <div className="evaluation-card">
              <h3>継続性（Grit）</h3>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${evaluationScore.gritScore}%` }}
                >
                  {evaluationScore.gritScore}%
                </div>
              </div>
              <p className="score-detail">{evaluationScore.gritDetails}</p>
            </div>
            <div className="evaluation-card">
              <h3>貢献度</h3>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${evaluationScore.contributionScore}%` }}
                >
                  {evaluationScore.contributionScore}%
                </div>
              </div>
              <p className="score-detail">{evaluationScore.contributionDetails}</p>
            </div>
          </div>
        </section>
      )}

      {/* 統計情報 */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>所属サークル数</h3>
          <p className="stat-value">{dashboard.stats.totalCircles}</p>
        </div>
        <div className="stat-card">
          <h3>総貢献数</h3>
          <p className="stat-value">{totalContributions}</p>
        </div>
        <div className="stat-card">
          <h3>活動ログ数</h3>
          <p className="stat-value">{totalActivities}</p>
        </div>
        <div className="stat-card">
          <h3>活動日数</h3>
          <p className="stat-value">{activeDays}</p>
        </div>
        <div className="stat-card">
          <h3>受けた支援</h3>
          <p className="stat-value">{dashboard.stats.totalSupports}</p>
        </div>
        <div className="stat-card">
          <h3>進行中支援</h3>
          <p className="stat-value">{dashboard.stats.activeSupports}</p>
        </div>
      </div>

      {/* 所属サークル */}
      <section className="section">
        <h2>所属サークル</h2>
        {dashboard.myCircles.length === 0 ? (
          <p className="empty-message">まだ所属しているサークルがありません</p>
        ) : (
          <div className="circles-grid">
            {dashboard.myCircles.map((circle) => {
              const member = circle.members.find(m => 
                m.userId?.toString() === user?.id?.toString() || 
                m.userId === user?.id
              );
              const myActivities = circle.activityLogs.filter(
                log => log.userId === user?.id
              );
              const myContributions = member?.contributions?.length || 0;
              
              return (
                <div key={circle._id} className="circle-card">
                  <div className="circle-header">
                    <h3>
                      <Link to={`/circles/${circle._id}`}>{circle.name}</Link>
                    </h3>
                    <span className="role-badge">{member?.role || 'member'}</span>
                  </div>
                  <p className="circle-university">{circle.university}</p>
                  <p className="circle-category">{circle.category}</p>
                  <div className="circle-stats">
                    <div className="circle-stat-item">
                      <span className="stat-label">貢献数:</span>
                      <span className="stat-value-small">{myContributions}</span>
                    </div>
                    <div className="circle-stat-item">
                      <span className="stat-label">活動数:</span>
                      <span className="stat-value-small">{myActivities.length}</span>
                    </div>
                    <div className="circle-stat-item">
                      <span className="stat-label">支援数:</span>
                      <span className="stat-value-small">{circle.supporters.length}</span>
                    </div>
                  </div>
                  <Link 
                    to={`/circles/${circle._id}`} 
                    className="view-details-link"
                  >
                    詳細を見る →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 最近の活動ログ */}
      <section className="section">
        <h2>最近の活動ログ</h2>
        {dashboard.recentActivities.length === 0 ? (
          <p className="empty-message">まだ活動ログがありません</p>
        ) : (
          <div className="activities-list">
            {dashboard.recentActivities.slice(0, 10).map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-header">
                  <h4>{activity.circleName}</h4>
                  <span className="activity-date">
                    {new Date(activity.date).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <p className="activity-text">{activity.activity}</p>
                <p className="contribution-text">
                  <strong>貢献:</strong> {activity.contribution}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 支援状況 */}
      {dashboard.recentSupports.length > 0 && (
        <section className="section">
          <h2>支援状況</h2>
          <div className="supports-list">
            {dashboard.recentSupports.map((support) => (
              <div key={support._id} className="support-item">
                <div className="support-header">
                  <h4>{support.circleId.name}</h4>
                  <span className={`status-badge status-${support.status}`}>
                    {support.status === 'pending' && '申請中'}
                    {support.status === 'approved' && '承認済み'}
                    {support.status === 'disbursed' && '支払済み'}
                    {support.status === 'completed' && '完了'}
                    {support.status === 'cancelled' && 'キャンセル'}
                  </span>
                </div>
                <p className="support-company">
                  支援企業: {support.companyId.companyName}
                </p>
                <p className="support-type">
                  種類: {support.supportType === 'funding' && '資金'}
                  {support.supportType === 'equipment' && '機材'}
                  {support.supportType === 'mentorship' && 'メンタリング'}
                  {support.supportType === 'software' && 'ソフトウェア'}
                </p>
                {support.amount > 0 && (
                  <p className="support-amount">金額: ¥{support.amount.toLocaleString()}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
