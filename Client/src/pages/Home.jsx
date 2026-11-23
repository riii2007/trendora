import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import useCategories from '../services/useCategories';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const categories = useCategories();

  useEffect(() => {
    api.get('/products', { params: { featured: 'true', sort: 'popularity' } })
      .then((r) => setFeatured(r.data.slice(0, 8))).catch(console.log);
  }, []);

  return (
    <>
      <section className="banner">
        <div className="container banner-content">
          <p className="banner-small">NEW SEASON COLLECTION</p>
          <h1>Discover Your Style.</h1>
          <p>Fresh fashion for men, women and kids. Shoes, watches and accessories to complete your look.</p>
          <Link to="/shop" className="btn">Shop Now</Link>
        </div>
      </section>

      <section className="container page">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-row">
          {categories.map((c) => (
            <Link key={c._id} to={'/shop?category=' + c.slug} className="category-box">{c.name}</Link>
          ))}
        </div>

        <h2 className="section-title">Trending Products</h2>
        <div className="product-grid">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
        {featured.length === 0 && <p className="center">No products yet.</p>}
        <div className="center"><Link to="/shop" className="btn btn-outline">View All Products</Link></div>
      </section>
    </>
  );
}
