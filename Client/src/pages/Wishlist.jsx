import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getError, imgUrl, onImgError } from '../api';
import PriceTag from '../components/PriceTag';
import { useStore } from '../context/StoreContext';

// one saved product with size selection and "Move to Bag"
function WishItem({ product }) {
  const { addToCart, toggleWishlist } = useStore();
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : '');
  const [color, setColor] = useState(product.colors.length === 1 ? product.colors[0] : '');
  const [error, setError] = useState('');

  const out = product.stock < 1;

  const moveToBag = async () => {
    if (product.sizes.length > 0 && !size) return setError('Please select a size');
    if (product.colors.length > 0 && !color) return setError('Please select a colour');
    try {
      await addToCart(product._id, size, color, 1);
      await toggleWishlist(product._id);          // removes it from the wishlist
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div className="wcard">
      <button className="remove-x" onClick={() => toggleWishlist(product._id)} title="Remove from wishlist">✕</button>
      <Link to={'/product/' + product._id}>
        <img src={imgUrl(product.images[0])} onError={onImgError} alt={product.name} />
      </Link>
      <div className="wbody">
        <h3 className="brand">{product.brand}</h3>
        <p className="pname">{product.name}</p>
        <PriceTag product={product} />

        {out ? <p className="out">Out of stock</p> : (
          <>
            {product.sizes.length > 1 && (
              <div className="chips">
                {product.sizes.map((s) => (
                  <button key={s} className={size === s ? 'chip active' : 'chip'} onClick={() => { setSize(s); setError(''); }}>{s}</button>
                ))}
              </div>
            )}
            {product.colors.length > 1 && (
              <div className="chips">
                {product.colors.map((c) => (
                  <button key={c} className={color === c ? 'chip active' : 'chip'} onClick={() => { setColor(c); setError(''); }}>{c}</button>
                ))}
              </div>
            )}
            {error && <p className="card-msg error">{error}</p>}
            <button className="btn full small" onClick={moveToBag}>MOVE TO BAG</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { wishlist } = useStore();

  return (
    <div className="container wide page">
      <h2 className="section-title">My Wishlist <span className="muted">({wishlist.length} items)</span></h2>
      {wishlist.length === 0 ? (
        <div className="center">
          <h3>Your wishlist is empty</h3>
          <p className="small">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn">Continue Shopping</Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map((p) => <WishItem key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
