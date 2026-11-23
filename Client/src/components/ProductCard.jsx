import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getError, imgUrl, onImgError } from '../api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { HeartIcon } from './Icons';
import PriceTag from './PriceTag';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const navigate = useNavigate();

  const [quick, setQuick] = useState(false);   // quick add panel open?
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const outOfStock = product.stock < 1;
  const link = '/product/' + product._id;
  const needsChoice = product.sizes.length > 1 || product.colors.length > 1;

  const flash = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 2500);
  };

  const handleWishlist = async () => {
    if (!user) return navigate('/login');
    try { await toggleWishlist(product._id); } catch (e) { flash(getError(e), 'error'); }
  };

  const add = async (s, c) => {
    try {
      await addToCart(product._id, s, c, 1);
      setQuick(false);
      flash('Added to bag ✓', 'success');
    } catch (e) {
      flash(getError(e), 'error');
    }
  };

  // Quick Add button: add directly if there is nothing to choose, otherwise open the size panel
  const handleQuickAdd = () => {
    if (!user) return navigate('/login');
    if (!needsChoice) return add(product.sizes[0] || '', product.colors[0] || '');
    setQuick(true);
  };

  const confirmAdd = () => {
    if (product.sizes.length > 1 && !size) return flash('Please select a size', 'error');
    if (product.colors.length > 1 && !color) return flash('Please select a colour', 'error');
    add(size || product.sizes[0] || '', color || product.colors[0] || '');
  };

  return (
    <div className="pcard">
      <div className="pimg">
        <Link to={link}>
          <img className="img-main" src={imgUrl(product.images[0])} onError={onImgError} alt={product.name} />
          {product.images.length > 1 && (
            <img className="img-alt" src={imgUrl(product.images[1])} onError={onImgError} alt="" />
          )}
        </Link>

        {product.rating > 0 && <span className="rate-pill">{Number(product.rating).toFixed(1)} ★</span>}
        <button className={inWishlist(product._id) ? 'heart active' : 'heart'} onClick={handleWishlist} title="Wishlist">
          <HeartIcon filled={inWishlist(product._id)} />
        </button>

        {outOfStock && <div className="sold-out">OUT OF STOCK</div>}

        {!outOfStock && (
          <div className={quick ? 'quick open' : 'quick'}>
            {quick ? (
              <div className="quick-panel">
                <button className="quick-close" onClick={() => setQuick(false)}>✕</button>
                {product.sizes.length > 1 && (
                  <>
                    <p>Select size</p>
                    <div className="chips">
                      {product.sizes.map((s) => (
                        <button key={s} className={size === s ? 'chip active' : 'chip'} onClick={() => setSize(s)}>{s}</button>
                      ))}
                    </div>
                  </>
                )}
                {product.colors.length > 1 && (
                  <>
                    <p>Select colour</p>
                    <div className="chips">
                      {product.colors.map((c) => (
                        <button key={c} className={color === c ? 'chip active' : 'chip'} onClick={() => setColor(c)}>{c}</button>
                      ))}
                    </div>
                  </>
                )}
                <button className="btn full small" onClick={confirmAdd}>ADD TO BAG</button>
              </div>
            ) : (
              <button className="quick-btn" onClick={handleQuickAdd}>QUICK ADD</button>
            )}
          </div>
        )}
        {msg.text && <p className={'toast ' + msg.type}>{msg.text}</p>}
      </div>

      <Link to={link} className="pinfo">
        <h3 className="brand">{product.brand}</h3>
        <p className="pname">{product.name}</p>
        <PriceTag product={product} />
      </Link>
    </div>
  );
}
