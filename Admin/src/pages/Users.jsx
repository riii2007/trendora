import { useEffect, useState } from 'react';
import api, { getError } from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/users').then((r) => setUsers(r.data)).catch(console.log);
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await api.delete('/admin/users/' + id); load(); } catch (err) { setError(getError(err)); }
  };

  return (
    <div>
      <h1>Customers</h1>
      {error && <p className="msg error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th><th>Action</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>{u.address?.street ? `${u.address.street}, ${u.address.city}` : '-'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><button className="btn small-btn danger" onClick={() => remove(u._id)}>Delete</button></td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="6">No customers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
