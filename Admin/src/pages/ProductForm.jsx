import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getError, imgUrl } from '../api';

const SIZE_PRESETS = {
  Clothes: 'S,M,L,XL,XXL',
  'Waist (jeans)': '28,30,32,34,36',
  Shoes: '6,7,8,9,10',
  Kids: '2-3Y,4-5Y,6-7Y,8-9Y',
  'Free Size': 'Free Size',
  None: '',
};

// used for both Add Product and Edit Product
export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', brand: '', description: '', material: '', details: '',
    price: '', salePrice: '', discount: 0, category: '', subcategory: '',
    sizes: 'S,M,L,XL,XXL', colors: '', stock: 10, rating: 4, featured: false,
  });
  const [categories, setCategories] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
    if (id) {
      api.get('/products/' + id).then((r) => {
        const p = r.data;
        setForm({
          name: p.name, brand: p.brand || '', description: p.description, material: p.material || '',
          details: (p.details || []).join('\n'), price: p.price, salePrice: p.salePrice ?? p.price,
          discount: p.discount || 0, category: p.category?._id || '', subcategory: p.subcategory || '',
          sizes: p.sizes.join(','), colors: (p.colors || []).join(','), stock: p.stock,
          rating: p.rating ?? 4, featured: p.featured,
        });
        setOldImages(p.images);
      }).catch((err) => setError(getError(err)));
    }
  }, [id]);

  // price, selling price and discount are linked to each other
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next = { ...form, [name]: type === 'checkbox' ? checked : value };

    if (name === 'price' || name === 'discount') {
      const p = Number(next.price) || 0, d = Number(next.discount) || 0;
      next.salePrice = p ? String(Math.round(p - (p * d) / 100)) : '';
    }
    if (name === 'salePrice') {
      const p = Number(next.price) || 0, sp = Number(next.salePrice) || 0;
      next.discount = p && sp && sp <= p ? Math.round(((p - sp) / p) * 100) : 0;
    }
    if (name === 'category') next.subcategory = '';
    setForm(next);
  };

  const subcategories = categories.find((c) => c._id === form.category)?.subcategories || [];
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category) return setError('Please select a category');
    if (subcategories.length > 0 && !form.subcategory) return setError('Please select a subcategory');
    if (Number(form.price) <= 0) return setError('Original price must be greater than 0');
    if (Number(form.salePrice) <= 0 || Number(form.salePrice) > Number(form.price)) return setError('Selling price must be more than 0 and not more than the original price');
    if (Number(form.rating) < 0 || Number(form.rating) > 5) return setError('Rating must be between 0 and 5');
    if (oldImages.length === 0 && files.length === 0) return setError('Please upload at least one image');

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    data.append('keepImages', JSON.stringify(oldImages));
    files.forEach((f) => data.append('images', f));

    setLoading(true);
    try {
      if (id) await api.put('/products/' + id, data);
      else await api.post('/products', data);
      navigate('/products');
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>
      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="msg error">{error}</p>}

        <div className="two-col">
          <div><label>Brand</label><input name="brand" value={form.brand} onChange={handleChange} required /></div>
          <div><label>Product Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
        </div>

        <div className="two-col">
          <div>
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Subcategory</label>
            <select name="subcategory" value={form.subcategory} onChange={handleChange} disabled={subcategories.length === 0}>
              <option value="">{subcategories.length ? 'Select subcategory' : 'No subcategories'}</option>
              {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="three-col">
          <div><label>Original Price (₹)</label><input type="number" name="price" min="1" value={form.price} onChange={handleChange} required /></div>
          <div><label>Discount (%)</label><input type="number" name="discount" min="0" max="90" value={form.discount} onChange={handleChange} /></div>
          <div><label>Selling Price (₹)</label><input type="number" name="salePrice" min="1" value={form.salePrice} onChange={handleChange} required /></div>
        </div>
        <p className="small">Change the discount and the selling price updates, or type the selling price and the discount updates.</p>

        <div className="two-col">
          <div><label>Stock Quantity</label><input type="number" name="stock" min="0" value={form.stock} onChange={handleChange} required /></div>
          <div><label>Rating (0 - 5)</label><input type="number" name="rating" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} /></div>
        </div>

        <label>Sizes (comma separated, empty if not applicable)</label>
        <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="S,M,L,XL,XXL" />
        <div className="presets">
          {Object.keys(SIZE_PRESETS).map((k) => (
            <button type="button" key={k} onClick={() => setForm({ ...form, sizes: SIZE_PRESETS[k] })}>{k}</button>
          ))}
        </div>

        <label>Colours (comma separated, empty if not applicable)</label>
        <input name="colors" value={form.colors} onChange={handleChange} placeholder="Black,White,Navy" />

        <label>Description</label>
        <textarea name="description" rows="3" value={form.description} onChange={handleChange} required />

        <label>Product Details (one point per line)</label>
        <textarea name="details" rows="4" value={form.details} onChange={handleChange} placeholder={'Regular fit\nRound neck\nMachine wash'} />

        <label>Material & Fabric</label>
        <input name="material" value={form.material} onChange={handleChange} placeholder="100% Cotton" />

        <label className="check"><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Show as trending product on home page</label>

        {oldImages.length > 0 && (
          <>
            <label>Current Images</label>
            <div className="img-row">
              {oldImages.map((img) => (
                <div key={img} className="img-box">
                  <img src={imgUrl(img)} alt="" />
                  <button type="button" onClick={() => setOldImages(oldImages.filter((i) => i !== img))}>Remove</button>
                </div>
              ))}
            </div>
          </>
        )}

        <label>Upload Images (max 5, jpg/png/webp - the 2nd image is shown on hover)</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))} />
        {previews.length > 0 && (
          <div className="img-row" style={{ marginTop: 10 }}>
            {previews.map((src) => <div key={src} className="img-box"><img src={src} alt="" /></div>)}
          </div>
        )}

        <div className="btn-row">
          <button className="btn" disabled={loading}>{loading ? 'Saving...' : id ? 'Update Product' : 'Add Product'}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
