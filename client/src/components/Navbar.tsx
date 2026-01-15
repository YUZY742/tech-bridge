import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          TECH-BRIDGE
        </Link>
        <div className="navbar-menu">
          <Link to="/circles" className="navbar-link">サークル一覧</Link>
          {user ? (
            <>
              {user.role === 'company' && (
                <Link to="/company/dashboard" className="navbar-link">ダッシュボード</Link>
              )}
              {user.role === 'student' && (
                <Link to="/student/dashboard" className="navbar-link">ダッシュボード</Link>
              )}
              <span className="navbar-user">{user.email}</span>
              <button onClick={handleLogout} className="navbar-button">ログアウト</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">ログイン</Link>
              <Link to="/register" className="navbar-button">登録</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
