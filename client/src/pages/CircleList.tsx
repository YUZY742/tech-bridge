import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './CircleList.css';

interface Circle {
  _id: string;
  name: string;
  description: string;
  university: string;
  category: string;
  currentStatus: string;
  techStack: {
    languages: string[];
  };
  needs: {
    funding: {
      amount: number;
      required: boolean;
    };
  };
  supporters?: Array<{
    status: string;
  }>;
  isRookie?: boolean;
}

const categories = [
  { id: '', label: 'すべて' },
  { id: 'ロボコン', label: 'ロボコン' },
  { id: 'ロケット', label: 'ロケット' },
  { id: '鳥人間', label: '鳥人間' },
  { id: 'その他', label: 'その他' }
];

const CircleList: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const params: any = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;

        const response = await axios.get(`${API_URL}/api/circles`, { params });
        setCircles(response.data.circles || response.data);
      } catch (error) {
        console.error('Error fetching circles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, [selectedCategory, searchQuery]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ロボコン':
        return '🤖';
      case 'ロケット':
        return '🚀';
      case '鳥人間':
        return '✈️';
      default:
        return '🔧';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ロボコン':
        return '#007AFF';
      case 'ロケット':
        return '#FF3B30';
      case '鳥人間':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  if (loading) {
    return (
      <div className="circle-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="circle-list">
      {/* ヘッダー */}
      <div className="circle-list-header">
        <h1>サークルを探す</h1>
        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="サークル名、大学名で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* サークルグリッド */}
      {circles.length > 0 ? (
        <div className="circle-grid">
          {circles.map((circle) => (
            <Link
              key={circle._id}
              to={`/circles/${circle._id}`}
              className="circle-card"
            >
              {/* アイコンエリア */}
              <div
                className="circle-icon"
                style={{ backgroundColor: getCategoryColor(circle.category) + '20' }}
              >
                <span className="category-emoji">{getCategoryIcon(circle.category)}</span>
              </div>

              {/* 情報エリア */}
              <div className="circle-info">
                <div className="circle-header">
                  <h3 className="circle-name">{circle.name}</h3>
                  {circle.isRookie && (
                    <span className="rookie-badge">NEW</span>
                  )}
                </div>
                <p className="circle-university">{circle.university}</p>
                <p className="circle-description">
                  {circle.description.length > 80
                    ? circle.description.substring(0, 80) + '...'
                    : circle.description}
                </p>
                
                {/* 技術スタック */}
                {circle.techStack?.languages && circle.techStack.languages.length > 0 && (
                  <div className="tech-tags">
                    {circle.techStack.languages.slice(0, 3).map((lang, idx) => (
                      <span key={idx} className="tech-tag">{lang}</span>
                    ))}
                    {circle.techStack.languages.length > 3 && (
                      <span className="tech-tag">+{circle.techStack.languages.length - 3}</span>
                    )}
                  </div>
                )}

                {/* フッター情報 */}
                <div className="circle-footer">
                  {circle.needs?.funding?.required && (
                    <span className="funding-indicator">
                      💰 資金支援募集中
                    </span>
                  )}
                  {circle.supporters && circle.supporters.length > 0 && (
                    <span className="supporters-count">
                      {circle.supporters.length}社が支援中
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>サークルが見つかりませんでした</h3>
          <p>検索条件を変更してお試しください</p>
        </div>
      )}
    </div>
  );
};

export default CircleList;
