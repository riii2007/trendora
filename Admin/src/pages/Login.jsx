import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getError } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      if (res.data.user.role !== 'admin') {
        setError('Access denied. This account is not an admin.');
      } else {
        localStorage.setItem('trendora_admin_token', res.data.token);
        localStorage.setItem('trendora_admin_user', JSON.stringify(res.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2 className="brand">TREND<span>ORA</span></h2>
        <p className="brand-sub">Admin Login</p>
        {error && <p className="msg error">{error}</p>}
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn full" disabled={loading}>{loading ? 'Please wait...' : 'Login'}</button>
      </form>
    </div>
  );
}
