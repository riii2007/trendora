import { useState } from 'react';
import { getError } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    pincode: user.address?.pincode || '',
    password: '',
  });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      phone: form.phone,
      address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
    };
    if (form.password) data.password = form.password;
    try {
      await updateProfile(data);
      setForm({ ...form, password: '' });
      setMsg({ text: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setMsg({ text: getError(err), type: 'error' });
    }
  };

  return (
    <div className="form-page">
      <form className="form-box wide" onSubmit={handleSubmit}>
        <h2>My Profile</h2>
        {msg.text && <p className={'msg ' + msg.type}>{msg.text}</p>}
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email (cannot be changed)</label>
        <input value={user.email} disabled />
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} maxLength={10} />
        <label>Street Address</label>
        <input name="street" value={form.street} onChange={handleChange} />
        <div className="two-col">
          <div><label>City</label><input name="city" value={form.city} onChange={handleChange} /></div>
          <div><label>State</label><input name="state" value={form.state} onChange={handleChange} /></div>
        </div>
        <label>Pincode</label>
        <input name="pincode" value={form.pincode} onChange={handleChange} maxLength={6} />
        <label>New Password (leave blank to keep the same)</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} />
        <button className="btn full">Save Changes</button>
      </form>
    </div>
  );
}
