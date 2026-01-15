import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    name: '',
    university: '',
    companyName: '',
    industry: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const profile = formData.role === 'company' 
      ? { companyName: formData.companyName, industry: formData.industry }
      : { name: formData.name, university: formData.university };

    try {
      await register(formData.email, formData.password, formData.role, profile);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登録に失敗しました');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>新規登録</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>メールアドレス</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>パスワード</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>アカウントタイプ</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">学生</option>
              <option value="company">企業</option>
            </select>
          </div>
          {formData.role === 'student' ? (
            <>
              <div className="form-group">
                <label>氏名</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>大学名</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>会社名</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>業界</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <button type="submit" className="submit-button">登録</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
