import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getError } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  return (
    <div className="form-page">
      <form className="form-box" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <p className="msg error">{error}</p>}
        <label>Name</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
        <label>Confirm Password</label>
        <input type="password" name="confirm" value={form.confirm} onChange={handleChange} required />
        <button className="btn full" disabled={loading}>{loading ? 'Please wait...' : 'Register'}</button>
        <p className="small">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
