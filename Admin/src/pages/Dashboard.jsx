import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(console.log);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card"><p>Total Products</p><h2>{stats.products}</h2></div>
        <div className="stat-card"><p>Total Customers</p><h2>{stats.users}</h2></div>
        <div className="stat-card"><p>Total Orders</p><h2>{stats.orders}</h2></div>
        <div className="stat-card"><p>Revenue (Delivered)</p><h2>₹{stats.revenue}</h2></div>
      </div>

      <h3 className="sub-title">Recent Orders</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-6).toUpperCase()}</td>
                <td>{o.user?.name || 'Deleted user'}</td>
                <td>₹{o.totalPrice}</td>
                <td><span className={'status ' + o.status.toLowerCase()}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {stats.recentOrders.length === 0 && <tr><td colSpan="5">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
