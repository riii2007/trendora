import { Fragment, useEffect, useState } from 'react';
import api, { getError } from '../api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/orders').then((r) => setOrders(r.data)).catch(console.log);
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      setOrders(orders.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) { setError(getError(err)); }
  };

  return (
    <div>
      <h1>Orders</h1>
      {error && <p className="msg error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Details</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <Fragment key={o._id}>
                <tr>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.user?.name || 'Deleted user'}<br /><span className="small">{o.user?.email}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>₹{o.totalPrice}</td>
                  <td>
                    <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="btn small-btn btn-outline" onClick={() => setOpen(open === o._id ? null : o._id)}>{open === o._id ? 'Hide' : 'View'}</button></td>
                </tr>
                {open === o._id && (
                  <tr className="details-row">
                    <td colSpan="6">
                      <b>Items:</b>
                      <ul>
                        {o.items.map((i, idx) => (
                          <li key={idx}>{i.name} {[i.size, i.color].filter(Boolean).length > 0 && `(${[i.size, i.color].filter(Boolean).join(', ')})`} × {i.quantity} — ₹{i.price * i.quantity}</li>
                        ))}
                      </ul>
                      <p><b>Deliver to:</b> {o.address.fullName}, {o.address.phone}<br />
                        {o.address.street}, {o.address.city}, {o.address.state} - {o.address.pincode}</p>
                      <p><b>Payment:</b> {o.paymentMethod}</p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {orders.length === 0 && <tr><td colSpan="6">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
