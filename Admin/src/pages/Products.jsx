import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError, imgUrl } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/products', { params: { sort: 'new' } }).then((r) => setProducts(r.data)).catch(console.log);
  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete('/products/' + id);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const text = search.toLowerCase();
  const shown = products.filter((p) => p.name.toLowerCase().includes(text) || (p.brand || '').toLowerCase().includes(text));

  return (
    <div>
      <div className="page-head">
        <h1>Products ({products.length})</h1>
        <Link to="/products/new" className="btn">+ Add Product</Link>
      </div>
      <input className="admin-search" placeholder="Search by name or brand..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {error && <p className="msg error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Image</th><th>Product</th><th>Category</th><th>Original</th><th>Discount</th><th>Selling</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p._id}>
                <td><img className="thumb" src={imgUrl(p.images[0])} alt="" /></td>
                <td><b>{p.brand}</b><br />{p.name}{p.featured && <span className="tag">Trending</span>}</td>
                <td>{p.category?.name}<br /><span className="small">{p.subcategory}</span></td>
                <td>₹{p.price}</td>
                <td>{p.discount || 0}%</td>
                <td><b>₹{p.salePrice ?? p.price}</b></td>
                <td className={p.stock < 1 ? 'low' : ''}>{p.stock}</td>
                <td>
                  <Link to={`/products/${p._id}/edit`} className="btn small-btn">Edit</Link>{' '}
                  <button className="btn small-btn danger" onClick={() => handleDelete(p._id, p.name)}>Delete</button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="8">No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
