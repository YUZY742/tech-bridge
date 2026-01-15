import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>学生ダッシュボード</h1>
      <p>こんにちは、{user?.profile?.name || user?.email}さん</p>
      <p>この機能は開発中です。</p>
    </div>
  );
};

export default StudentDashboard;
