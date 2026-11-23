import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getError, imgUrl, onImgError } from '../api';
import { useStore } from '../context/StoreContext';

// Shopping Bag page
export default function Cart() {
  const { cart, cartCount, cartTotal, cartMrp, updateItem, removeItem } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const change = async (itemId, changes) => {
    setError('');
    try { await updateItem(itemId, changes); } catch (err) { setError(getError(err)); }
  };

  const remove = async (itemId) => {
    setError('');
    try { await removeItem(itemId); } catch (err) { setError(getError(err)); }
  };

  if (cart.length === 0) {
    return (
      <div className="container page center">
        <h2>Your bag is empty</h2>
        <p className="small">Add something you like from our collection.</p>
        <Link to="/shop" className="btn">Continue Shopping</Link>
      </div>
    );
  }

  const discount = cartMrp - cartTotal;

  return (
    <div className="container wide page">
      <h2 className="section-title">My Bag <span className="muted">({cartCount} items)</span></h2>
      {error && <p className="msg error">{error}</p>}

      <div className="bag-layout">
        <div>
          {cart.map((item) => {
            const p = item.product;
            return (
              <div className="bag-item" key={item._id}>
                <Link to={'/product/' + p._id}>
                  <img src={imgUrl(p.images[0])} onError={onImgError} alt={p.name} />
                </Link>
                <div className="bag-info">
                  <h4>{p.brand}</h4>
                  <Link to={'/product/' + p._id} className="bag-name">{p.name}</Link>

                  <div className="bag-selects">
                    {p.sizes.length > 0 && (
                      <label>Size:
                        <select value={item.size} onChange={(e) => change(item._id, { size: e.target.value })}>
                          {p.sizes.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </label>
                    )}
                    {p.colors.length > 1 && (
                      <label>Colour:
                        <select value={item.color} onChange={(e) => change(item._id, { color: e.target.value })}>
                          {p.colors.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </label>
                    )}
                    <label>Qty:
                      <select value={item.quantity} onChange={(e) => change(item._id, { quantity: Number(e.target.value) })}>
                        {Array.from({ length: Math.max(1, Math.min(10, p.stock)) }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
                      </select>
                    </label>
                  </div>
                  {p.colors.length === 1 && <p className="small">Colour: {item.color}</p>}

                  <p className="price-tag">
                    <span className="sale">₹{p.salePrice * item.quantity}</span>
                    {p.discount > 0 && <><span className="mrp">₹{p.price * item.quantity}</span><span className="off">({p.discount}% OFF)</span></>}
                  </p>
                  <p className="small">Free delivery · Easy returns</p>
                </div>
                <button className="remove-x" onClick={() => remove(item._id)} title="Remove">✕</button>
              </div>
            );
          })}
        </div>

        <aside className="price-box">
          <h4>PRICE DETAILS ({cartCount} {cartCount === 1 ? 'item' : 'items'})</h4>
          <p className="row"><span>Total MRP</span><span>₹{cartMrp}</span></p>
          <p className="row"><span>Discount on MRP</span><span className="green">- ₹{discount}</span></p>
          <p className="row"><span>Delivery Fee</span><span className="green">FREE</span></p>
          <p className="row total"><span>Total Amount</span><span>₹{cartTotal}</span></p>
          {discount > 0 && <p className="save-note">You will save ₹{discount} on this order</p>}
          <button className="btn full" onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT</button>
          <p className="small center-text">Payment: Cash on Delivery</p>
        </aside>
      </div>
    </div>
  );
}
