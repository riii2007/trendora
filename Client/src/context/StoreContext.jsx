import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const StoreContext = createContext();
export const useStore = () => useContext(StoreContext);

// keeps the shopping bag and wishlist in sync with the backend
export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const c = await api.get('/cart');
        setCart(c.data.items.filter((i) => i.product));
        const w = await api.get('/wishlist');
        setWishlist(w.data.products.filter(Boolean));
      } catch (err) {
        console.log(err);
      }
    };
    if (user) load();
    else { setCart([]); setWishlist([]); }
  }, [user]);

  const addToCart = async (productId, size, color, quantity) => {
    const res = await api.post('/cart', { productId, size, color, quantity });
    setCart(res.data.items.filter((i) => i.product));
  };

  // changes: { quantity } or { size } or { color }
  const updateItem = async (itemId, changes) => {
    const res = await api.put('/cart/' + itemId, changes);
    setCart(res.data.items.filter((i) => i.product));
  };

  const removeItem = async (itemId) => {
    const res = await api.delete('/cart/' + itemId);
    setCart(res.data.items.filter((i) => i.product));
  };

  const toggleWishlist = async (productId) => {
    const res = await api.post('/wishlist/' + productId);
    setWishlist(res.data.products.filter(Boolean));
  };

  const inWishlist = (id) => wishlist.some((p) => p._id === id);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.salePrice * i.quantity, 0);   // what the customer pays
  const cartMrp = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);         // total of original prices

  return (
    <StoreContext.Provider
      value={{ cart, wishlist, cartCount, cartTotal, cartMrp, addToCart, updateItem, removeItem, toggleWishlist, inWishlist, setCart }}
    >
      {children}
    </StoreContext.Provider>
  );
}
