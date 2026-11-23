import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getError } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  return (
    <div className="form-page">
      <form className="form-box" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="msg error">{error}</p>}
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
        <button className="btn full" disabled={loading}>{loading ? 'Please wait...' : 'Login'}</button>
        <p className="small">New to Trendora? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
