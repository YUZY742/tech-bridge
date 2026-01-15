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
}

const CircleList: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const params: any = {};
        if (filters.category) params.category = filters.category;
        if (filters.search) params.search = filters.search;

        const response = await axios.get(`${API_URL}/api/circles`, { params });
        setCircles(response.data.circles || response.data);
      } catch (error) {
        console.error('Error fetching circles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, [filters]);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="circle-list">
      <h1>サークル一覧</h1>
      
      <div className="filters">
        <input
          type="text"
          placeholder="検索..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="search-input"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="filter-select"
        >
          <option value="">すべてのカテゴリ</option>
          <option value="ロボコン">ロボコン</option>
          <option value="ロケット">ロケット</option>
          <option value="鳥人間">鳥人間</option>
          <option value="その他">その他</option>
        </select>
      </div>

      <div className="circle-grid">
        {circles.map((circle) => (
          <Link key={circle._id} to={`/circles/${circle._id}`} className="circle-card">
            <h3>{circle.name}</h3>
            <p className="university">{circle.university}</p>
            <p className="category">{circle.category}</p>
            <p className="description">{circle.description.substring(0, 150)}...</p>
            {circle.needs?.funding?.required && (
              <div className="funding-badge">
                資金支援が必要: ¥{circle.needs.funding.amount?.toLocaleString()}
              </div>
            )}
          </Link>
        ))}
      </div>

      {circles.length === 0 && (
        <div className="no-results">サークルが見つかりませんでした</div>
      )}
    </div>
  );
};

export default CircleList;
