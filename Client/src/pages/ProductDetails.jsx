import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import api, { getError, imgUrl, onImgError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import PriceTag from '../components/PriceTag';
import { HeartIcon } from '../components/Icons';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [mainImg, setMainImg] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  // pincode check
  const [pin, setPin] = useState(localStorage.getItem('trendora_pincode') || '');
  const [delivery, setDelivery] = useState(null);
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    setLoading(true);
    setMainImg(0); setSize(''); setColor(''); setQty(1); setMsg({ text: '', type: '' });
    api.get('/products/' + id)
      .then((r) => {
        setProduct(r.data);
        // only one size / colour -> select it automatically
        if (r.data.sizes.length === 1) setSize(r.data.sizes[0]);
        if (r.data.colors.length === 1) setColor(r.data.colors[0]);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    api.get(`/products/${id}/related`).then((r) => setSimilar(r.data)).catch(() => setSimilar([]));
    window.scrollTo(0, 0);
  }, [id]);

  const requireLogin = () => navigate('/login', { state: { from: location } });

  const checkOptions = () => {
    if (product.sizes.length > 0 && !size) { setMsg({ text: 'Please select a size', type: 'error' }); return false; }
    if (product.colors.length > 0 && !color) { setMsg({ text: 'Please select a colour', type: 'error' }); return false; }
    return true;
  };

  const handleAdd = async () => {
    if (!user) return requireLogin();
    if (!checkOptions()) return;
    try {
      await addToCart(product._id, size, color, qty);
      setMsg({ text: 'Added to bag!', type: 'success' });
    } catch (err) {
      setMsg({ text: getError(err), type: 'error' });
    }
  };

  const handleBuyNow = async () => {
    if (!user) return requireLogin();
    if (!checkOptions()) return;
    try {
      await addToCart(product._id, size, color, qty);
      navigate('/checkout');
    } catch (err) {
      setMsg({ text: getError(err), type: 'error' });
    }
  };

  const handleWishlist = async () => {
    if (!user) return requireLogin();
    try { await toggleWishlist(product._id); } catch (err) { setMsg({ text: getError(err), type: 'error' }); }
  };

  const checkPin = async (e) => {
    e.preventDefault();
    setPinError(''); setDelivery(null);
    try {
      const res = await api.get('/delivery/' + pin.trim());
      setDelivery(res.data);
      localStorage.setItem('trendora_pincode', pin.trim());
    } catch (err) {
      setPinError(getError(err));
    }
  };

  if (loading) return <p className="center page">Loading...</p>;
  if (!product) return <p className="center page">Product not found.</p>;

  const out = product.stock < 1;

  return (
    <div className="container wide page">
      <p className="crumbs">
        <Link to="/">Home</Link> / <Link to={'/shop?category=' + product.category?.slug}>{product.category?.name}</Link>
        {product.subcategory && <> / <Link to={`/shop?category=${product.category?.slug}&subcategory=${encodeURIComponent(product.subcategory)}`}>{product.subcategory}</Link></>}
        {' '}/ {product.name}
      </p>

      <div className="pd">
        <div className="pd-gallery">
          <div className="pd-thumbs">
            {product.images.map((img, i) => (
              <img key={i} src={imgUrl(img)} onError={onImgError} alt="" className={i === mainImg ? 'active' : ''} onClick={() => setMainImg(i)} />
            ))}
          </div>
          <div className="pd-main">
            <img src={imgUrl(product.images[mainImg])} onError={onImgError} alt={product.name} />
            {product.rating > 0 && <span className="rate-pill big">{Number(product.rating).toFixed(1)} ★</span>}
          </div>
        </div>

        <div className="pd-info">
          <h1 className="pd-brand">{product.brand}</h1>
          <p className="pd-name">{product.name}</p>
          <div className="pd-price">
            <PriceTag product={product} big />
            <p className="small">inclusive of all taxes</p>
          </div>

          {product.sizes.length > 0 && (
            <>
              <h4>SELECT SIZE</h4>
              <div className="size-row">
                {product.sizes.map((s) => (
                  <button key={s} className={size === s ? 'size-btn active' : 'size-btn'} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </>
          )}

          {product.colors.length > 0 && (
            <>
              <h4>SELECT COLOUR</h4>
              <div className="size-row">
                {product.colors.map((c) => (
                  <button key={c} className={color === c ? 'color-btn active' : 'color-btn'} onClick={() => setColor(c)}>{c}</button>
                ))}
              </div>
            </>
          )}

          <h4>QUANTITY</h4>
          <div className="qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty(Math.min(Math.min(product.stock, 10) || 1, qty + 1))}>+</button>
          </div>
          <p className={out ? 'stock out' : 'stock in'}>
            {out ? 'Out of stock' : product.stock <= 5 ? `Hurry! Only ${product.stock} left` : 'In stock'}
          </p>

          {msg.text && <p className={'msg ' + msg.type}>{msg.text}</p>}

          <div className="pd-actions">
            <button className="btn buy" onClick={handleAdd} disabled={out}>ADD TO BAG</button>
            <button className="btn" onClick={handleBuyNow} disabled={out}>BUY NOW</button>
            <button className={inWishlist(product._id) ? 'btn btn-outline wish active' : 'btn btn-outline wish'} onClick={handleWishlist}>
              <HeartIcon filled={inWishlist(product._id)} /> WISHLIST
            </button>
          </div>

          <div className="pd-block">
            <h4>DELIVERY OPTIONS</h4>
            <form className="pin-form" onSubmit={checkPin}>
              <input type="text" placeholder="Enter pincode" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
              <button className="btn small btn-outline">CHECK</button>
            </form>
            {pinError && <p className="msg error">{pinError}</p>}
            {delivery && (
              <div className={delivery.available ? 'msg success' : 'msg error'}>
                {delivery.available ? (
                  <>
                    <b>Delivery by {delivery.deliveryBy}</b>
                    <br />{delivery.message} · Cash on Delivery available
                  </>
                ) : delivery.message}
              </div>
            )}
            <p className="small">Free delivery · Easy returns</p>
          </div>

          <div className="pd-block">
            <h4>PRODUCT DETAILS</h4>
            <p className="desc">{product.description}</p>
            {product.details.length > 0 && (
              <ul className="detail-list">
                {product.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}
          </div>

          {product.material && (
            <div className="pd-block">
              <h4>MATERIAL & FABRIC</h4>
              <p className="desc">{product.material}</p>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <>
          <h2 className="section-title">Similar Products</h2>
          <div className="product-grid">
            {similar.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
