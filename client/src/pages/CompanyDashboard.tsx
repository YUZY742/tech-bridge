import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'company') {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/companies/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (!dashboard) {
    return <div className="error">ダッシュボードの読み込みに失敗しました</div>;
  }

  return (
    <div className="dashboard">
      <h1>企業ダッシュボード</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>支援中のサークル</h3>
          <p className="stat-value">{dashboard.stats.totalSupported}</p>
        </div>
        <div className="stat-card">
          <h3>総予算</h3>
          <p className="stat-value">¥{dashboard.stats.totalBudget?.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>使用済み予算</h3>
          <p className="stat-value">¥{dashboard.stats.usedBudget?.toLocaleString()}</p>
        </div>
      </div>

      <section className="section">
        <h2>おすすめのサークル</h2>
        <div className="recommended-circles">
          {dashboard.recommendedCircles?.map((circle: any) => (
            <div key={circle._id} className="circle-card">
              <h3>{circle.name}</h3>
              <p>{circle.university}</p>
              <p className="category">{circle.category}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CompanyDashboard;
