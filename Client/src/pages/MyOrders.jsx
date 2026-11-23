import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { imgUrl, onImgError } from '../api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    api.get('/orders/my').then((r) => setOrders(r.data)).catch(console.log).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center page">Loading orders...</p>;

  return (
    <div className="container page">
      <h2 className="section-title">My Orders</h2>
      {location.state?.placed && <p className="msg success">Your order has been placed successfully!</p>}

      {orders.length === 0 ? (
        <div className="center">
          <p>You have not placed any orders yet.</p>
          <Link to="/shop" className="btn">Start Shopping</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-box" key={order._id}>
            <div className="order-head">
              <div>
                <p><b>Order #{order._id.slice(-6).toUpperCase()}</b></p>
                <p className="small">{new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod}</p>
              </div>
              <span className={'status ' + order.status.toLowerCase()}>{order.status}</span>
            </div>
            {order.items.map((item, i) => (
              <div className="order-item" key={i}>
                <img src={imgUrl(item.image)} onError={onImgError} alt={item.name} />
                <div>
                  <p>{item.brand && <b>{item.brand} </b>}{item.name}</p>
                  <p className="small">{item.size && `Size: ${item.size} · `}{item.color && `Colour: ${item.color} · `}Qty: {item.quantity} · ₹{item.price}</p>
                </div>
              </div>
            ))}
            <p className="small">Deliver to: {order.address.fullName}, {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
            <p className="order-total">Total: ₹{order.totalPrice}</p>
          </div>
        ))
      )}
    </div>
  );
}
