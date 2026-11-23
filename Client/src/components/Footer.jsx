import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <h3>TRENDORA</h3>
          <p>Discover Your Style.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/shop">Shop</Link>
          <Link to="/bag">Shopping Bag</Link>
          <Link to="/orders">My Orders</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p>support@trendora.com</p>
          <p>Ahmedabad, India</p>
        </div>
      </div>
      <p className="copyright">© 2026 Trendora. College project.</p>
    </footer>
  );
}
