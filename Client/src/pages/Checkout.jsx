import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, cartTotal, cartMrp, setCart } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user.name,
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    pincode: user.address?.pincode || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', { address: form });
      setCart([]);
      navigate('/orders', { state: { placed: true } });
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="container page center">
        <h2>Your bag is empty</h2>
        <Link to="/shop" className="btn">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h2 className="section-title">Checkout</h2>
      <div className="cart-layout">
        <form className="checkout-form" onSubmit={placeOrder}>
          <h3>Delivery Address</h3>
          {error && <p className="msg error">{error}</p>}
          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
          <label>Phone (10 digits)</label>
          <input name="phone" value={form.phone} onChange={handleChange} maxLength={10} required />
          <label>Street Address</label>
          <input name="street" value={form.street} onChange={handleChange} required />
          <div className="two-col">
            <div><label>City</label><input name="city" value={form.city} onChange={handleChange} required /></div>
            <div><label>State</label><input name="state" value={form.state} onChange={handleChange} required /></div>
          </div>
          <label>Pincode (6 digits)</label>
          <input name="pincode" value={form.pincode} onChange={handleChange} maxLength={6} required />

          <h3>Payment Method</h3>
          <label className="radio"><input type="radio" checked readOnly /> Cash on Delivery</label>
          <p className="small">Online payment will be added in a future version.</p>

          <button className="btn full" disabled={loading}>{loading ? 'Placing order...' : 'Place Order'}</button>
        </form>

        <div className="summary">
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <p className="row" key={item._id}>
              <span>{item.product.brand} {item.product.name} {[item.size, item.color].filter(Boolean).length > 0 && `(${[item.size, item.color].filter(Boolean).join(', ')})`} × {item.quantity}</span>
              <span>₹{item.product.salePrice * item.quantity}</span>
            </p>
          ))}
          <p className="row"><span>Total MRP</span><span>₹{cartMrp}</span></p>
          <p className="row"><span>Discount</span><span className="green">- ₹{cartMrp - cartTotal}</span></p>
          <p className="row"><span>Delivery</span><span>Free</span></p>
          <p className="row total"><span>Total</span><span>₹{cartTotal}</span></p>
        </div>
      </div>
    </div>
  );
}
