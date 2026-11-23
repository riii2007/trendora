import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('trendora_admin_user') || '{}');

  const logout = () => {
    localStorage.removeItem('trendora_admin_token');
    localStorage.removeItem('trendora_admin_user');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="brand">TREND<span>ORA</span></h2>
        <p className="brand-sub">Admin Panel</p>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/users">Customers</NavLink>
        <div className="sidebar-bottom">
          <p>{admin.name}</p>
          <button className="btn small-btn" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}
