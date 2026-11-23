import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import useCategories from '../services/useCategories';
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useStore();
  const categories = useCategories();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);   // mobile menu
  const [openCat, setOpenCat] = useState(null);      // mobile: which category is expanded
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // search suggestions (wait 300ms after typing)
  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(() => {
      api.get('/products/suggestions', { params: { q: query.trim() } })
        .then((r) => setSuggestions(r.data)).catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const closeAll = () => { setMenuOpen(false); setOpenCat(null); setSuggestions([]); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate('/shop?search=' + encodeURIComponent(query.trim()));
    setSuggestions([]);
    setMenuOpen(false);
  };

  const openSuggestion = (id) => { setQuery(''); closeAll(); navigate('/product/' + id); };
  const handleLogout = () => { logout(); closeAll(); navigate('/'); };

  return (
    <header className="navbar">
      <div className="nav-top">
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button>
        <Link to="/" className="logo" onClick={closeAll}>TREND<span>ORA</span></Link>

        <nav className={menuOpen ? 'nav-cats open' : 'nav-cats'}>
          {categories.map((c) => (
            <div key={c._id} className={openCat === c._id ? 'nav-cat open' : 'nav-cat'}>
              <Link to={'/shop?category=' + c.slug} onClick={closeAll}>{c.name}</Link>
              <span className="arrow" onClick={() => setOpenCat(openCat === c._id ? null : c._id)}>▾</span>
              {c.subcategories.length > 0 && (
                <div className="dropdown">
                  <p className="dd-title">{c.name}</p>
                  {c.subcategories.map((s) => (
                    <Link key={s} to={`/shop?category=${c.slug}&subcategory=${encodeURIComponent(s)}`} onClick={closeAll}>{s}</Link>
                  ))}
                  <Link className="dd-all" to={'/shop?category=' + c.slug} onClick={closeAll}>View all {c.name}</Link>
                </div>
              )}
            </div>
          ))}

          {/* only shown inside the mobile menu */}
          <div className="mobile-links">
            {user ? (
              <>
                <Link to="/orders" onClick={closeAll}>My Orders</Link>
                <button className="link-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeAll}>Login</Link>
                <Link to="/register" onClick={closeAll}>Register</Link>
              </>
            )}
          </div>
        </nav>

        <form className="nav-search" onSubmit={handleSearch}>
          <SearchIcon />
          <input type="text" placeholder="Search for products, brands and more" value={query} onChange={(e) => setQuery(e.target.value)} />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((s) => (
                <li key={s._id} onClick={() => openSuggestion(s._id)}>
                  <b>{s.brand}</b> {s.name}
                </li>
              ))}
              <li className="see-all" onClick={handleSearch}>See all results for "{query}"</li>
            </ul>
          )}
        </form>

        <div className="nav-icons">
          <div className="nav-icon user-icon">
            <Link to={user ? '/profile' : '/login'} onClick={closeAll}><UserIcon /><span>Profile</span></Link>
            <div className="dropdown right">
              {user ? (
                <>
                  <p className="dd-title">Hello, {user.name.split(' ')[0]}</p>
                  <Link to="/profile">My Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/wishlist">Wishlist</Link>
                  <button className="link-btn" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <p className="dd-title">Welcome</p>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </div>
          <Link to="/wishlist" className="nav-icon" onClick={closeAll}>
            <HeartIcon /><span>Wishlist</span>
            {wishlist.length > 0 && <em className="count">{wishlist.length}</em>}
          </Link>
          <Link to="/bag" className="nav-icon" onClick={closeAll}>
            <BagIcon /><span>Bag</span>
            {cartCount > 0 && <em className="count">{cartCount}</em>}
          </Link>
        </div>
      </div>
    </header>
  );
}
