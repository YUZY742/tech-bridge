import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import './CircleDetail.css';

const CircleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [circle, setCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCircle();
    }
  }, [id]);

  const fetchCircle = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/circles/${id}`);
      setCircle(response.data);
    } catch (error) {
      console.error('Error fetching circle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (!circle) {
    return <div className="error">サークルが見つかりませんでした</div>;
  }

  return (
    <div className="circle-detail">
      <h1>{circle.name}</h1>
      <div className="circle-meta">
        <span className="university">{circle.university}</span>
        <span className="category">{circle.category}</span>
      </div>

      <section className="section">
        <h2>概要</h2>
        <p>{circle.description}</p>
      </section>

      <section className="section">
        <h2>現在の開発状況</h2>
        <p>{circle.currentStatus}</p>
      </section>

      {circle.techStack && (
        <section className="section">
          <h2>技術スタック</h2>
          <div className="tech-stack">
            {circle.techStack.languages && circle.techStack.languages.length > 0 && (
              <div>
                <h3>使用言語</h3>
                <div className="tags">
                  {circle.techStack.languages.map((lang: string, idx: number) => (
                    <span key={idx} className="tag">{lang}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {circle.needs && (
        <section className="section">
          <h2>必要な支援</h2>
          {circle.needs.funding?.required && (
            <div className="need-item">
              <strong>資金:</strong> ¥{circle.needs.funding.amount?.toLocaleString()}
              <p>{circle.needs.funding.purpose}</p>
            </div>
          )}
        </section>
      )}

      {user?.role === 'company' && (
        <div className="action-buttons">
          <button className="support-button">支援を申し込む</button>
        </div>
      )}
    </div>
  );
};

export default CircleDetail;
