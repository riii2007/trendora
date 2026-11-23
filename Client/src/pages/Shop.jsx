import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import useCategories from '../services/useCategories';
import { colorHex } from '../services/colors';

const PRICES = [
  { label: 'Under ₹500', min: '', max: '500' },
  { label: '₹500 - ₹1000', min: '500', max: '1000' },
  { label: '₹1000 - ₹2000', min: '1000', max: '2000' },
  { label: '₹2000 - ₹5000', min: '2000', max: '5000' },
  { label: 'Above ₹5000', min: '5000', max: '' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const categories = useCategories();
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState({ subcategories: [], brands: [], sizes: [], colors: [] });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [min, setMin] = useState(params.get('minPrice') || '');
  const [max, setMax] = useState(params.get('maxPrice') || '');

  // all filters live in the url, lists are comma separated (brand=Zenith,Strider)
  const get = (key) => params.get(key) || '';
  const getList = (key) => (get(key) ? get(key).split(',') : []);

  const category = get('category');
  const search = get('search');
  const sort = get('sort');
  const minPrice = get('minPrice');
  const maxPrice = get('maxPrice');
  const discount = get('discount');
  const rating = get('rating');
  const inStock = get('inStock');
  const subcategory = getList('subcategory');
  const brand = getList('brand');
  const size = getList('size');
  const color = getList('color');

  // load filter options (brands, sizes...) for the current category / search
  useEffect(() => {
    api.get('/products/filters', { params: { category, search } })
      .then((r) => setFacets(r.data)).catch(console.log);
  }, [category, search]);

  // load products whenever any filter changes
  useEffect(() => {
    setLoading(true);
    const query = {
      category, search, sort, minPrice, maxPrice, discount, rating, inStock,
      subcategory: subcategory.join(','), brand: brand.join(','), size: size.join(','), color: color.join(','),
    };
    Object.keys(query).forEach((k) => { if (!query[k]) delete query[k]; });
    api.get('/products', { params: query })
      .then((r) => setProducts(r.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [params]); // eslint-disable-line

  useEffect(() => { setMin(minPrice); setMax(maxPrice); }, [minPrice, maxPrice]);

  const setFilter = (changes) => {
    const p = new URLSearchParams(params);
    Object.keys(changes).forEach((k) => {
      if (changes[k]) p.set(k, changes[k]); else p.delete(k);
    });
    setParams(p);
  };

  // tick / untick one value of a multi select filter
  const toggle = (key, value) => {
    const list = getList(key);
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    setFilter({ [key]: next.join(',') });
  };

  const applyPrice = (e) => {
    e.preventDefault();
    if (min && max && Number(min) > Number(max)) return alert('Minimum price cannot be more than maximum price');
    setFilter({ minPrice: min, maxPrice: max });
  };

  const clearAll = () => setParams(category ? { category } : search ? { search } : {});

  // chips of selected filters shown above the products
  const applied = [
    ...subcategory.map((v) => ({ key: 'subcategory', value: v, label: v })),
    ...brand.map((v) => ({ key: 'brand', value: v, label: v })),
    ...size.map((v) => ({ key: 'size', value: v, label: 'Size: ' + v })),
    ...color.map((v) => ({ key: 'color', value: v, label: v })),
  ];

  const currentCat = categories.find((c) => c.slug === category);
  const title = search ? `Results for "${search}"`
    : subcategory.length === 1 ? subcategory[0]
    : currentCat ? currentCat.name : 'All Products';

  const brandList = showAllBrands ? facets.brands : facets.brands.slice(0, 7);
  const hasFilters = applied.length > 0 || minPrice || maxPrice || discount || rating || inStock;

  return (
    <div className="container wide page">
      <p className="crumbs">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link>
        {currentCat && <> / <Link to={'/shop?category=' + currentCat.slug}>{currentCat.name}</Link></>}
        {subcategory.length === 1 && <> / {subcategory[0]}</>}
      </p>

      <div className="list-head">
        <h1>{title} <span>- {loading ? '...' : products.length} items</span></h1>
        <div className="list-tools">
          <button className="btn btn-outline small filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
          <select value={sort} onChange={(e) => setFilter({ sort: e.target.value })}>
            <option value="">Sort by: Recommended</option>
            <option value="new">What's New</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popularity">Popularity</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      {(applied.length > 0 || hasFilters) && (
        <div className="applied">
          {applied.map((a) => (
            <span className="applied-chip" key={a.key + a.value} onClick={() => toggle(a.key, a.value)}>{a.label} ✕</span>
          ))}
          {(minPrice || maxPrice) && <span className="applied-chip" onClick={() => setFilter({ minPrice: '', maxPrice: '' })}>₹{minPrice || 0} - {maxPrice ? '₹' + maxPrice : 'above'} ✕</span>}
          {discount && <span className="applied-chip" onClick={() => setFilter({ discount: '' })}>{discount}% and above ✕</span>}
          {rating && <span className="applied-chip" onClick={() => setFilter({ rating: '' })}>{rating}★ and above ✕</span>}
          {inStock && <span className="applied-chip" onClick={() => setFilter({ inStock: '' })}>In stock only ✕</span>}
          <button className="link-btn danger" onClick={clearAll}>Clear all</button>
        </div>
      )}

      <div className="shop-layout">
        <aside className={showFilters ? 'filters open' : 'filters'}>
          <h4 className="filters-title">FILTERS</h4>

          <div className="f-block">
            <h5>Category</h5>
            {currentCat ? (
              facets.subcategories.map((s) => (
                <label className="f-check" key={s.name}>
                  <input type="checkbox" checked={subcategory.includes(s.name)} onChange={() => toggle('subcategory', s.name)} />
                  {s.name} <small>({s.count})</small>
                </label>
              ))
            ) : (
              categories.map((c) => (
                <label className="f-check" key={c._id}>
                  <input type="radio" checked={false} onChange={() => setFilter({ category: c.slug, subcategory: '' })} />
                  {c.name}
                </label>
              ))
            )}
          </div>

          <div className="f-block">
            <h5>Brand</h5>
            {brandList.map((b) => (
              <label className="f-check" key={b.name}>
                <input type="checkbox" checked={brand.includes(b.name)} onChange={() => toggle('brand', b.name)} />
                {b.name} <small>({b.count})</small>
              </label>
            ))}
            {facets.brands.length > 7 && (
              <button className="link-btn more" onClick={() => setShowAllBrands(!showAllBrands)}>
                {showAllBrands ? 'Show less' : `+ ${facets.brands.length - 7} more`}
              </button>
            )}
          </div>

          <div className="f-block">
            <h5>Price</h5>
            {PRICES.map((p) => (
              <label className="f-check" key={p.label}>
                <input type="radio" name="price" checked={minPrice === p.min && maxPrice === p.max}
                  onChange={() => setFilter({ minPrice: p.min, maxPrice: p.max })} />
                {p.label}
              </label>
            ))}
            <form className="price-form" onSubmit={applyPrice}>
              <input type="number" min="0" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
              <span>-</span>
              <input type="number" min="0" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
              <button className="btn small">Go</button>
            </form>
          </div>

          <div className="f-block">
            <h5>Discount</h5>
            {[10, 20, 30, 40, 50].map((d) => (
              <label className="f-check" key={d}>
                <input type="radio" name="discount" checked={discount === String(d)} onChange={() => setFilter({ discount: String(d) })} />
                {d}% and above
              </label>
            ))}
          </div>

          {facets.sizes.length > 0 && (
            <div className="f-block">
              <h5>Size</h5>
              <div className="size-grid">
                {facets.sizes.map((s) => (
                  <button key={s} className={size.includes(s) ? 'chip active' : 'chip'} onClick={() => toggle('size', s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {facets.colors.length > 0 && (
            <div className="f-block">
              <h5>Colour</h5>
              {facets.colors.map((c) => (
                <label className="f-check" key={c.name}>
                  <input type="checkbox" checked={color.includes(c.name)} onChange={() => toggle('color', c.name)} />
                  <i className="dot" style={{ background: colorHex(c.name) }}></i>
                  {c.name} <small>({c.count})</small>
                </label>
              ))}
            </div>
          )}

          <div className="f-block">
            <h5>Rating</h5>
            {[4, 3, 2].map((r) => (
              <label className="f-check" key={r}>
                <input type="radio" name="rating" checked={rating === String(r)} onChange={() => setFilter({ rating: String(r) })} />
                {r}★ and above
              </label>
            ))}
          </div>

          <div className="f-block">
            <h5>Availability</h5>
            <label className="f-check">
              <input type="checkbox" checked={inStock === 'true'} onChange={(e) => setFilter({ inStock: e.target.checked ? 'true' : '' })} />
              Exclude out of stock
            </label>
          </div>

          <button className="btn full filters-done" onClick={() => setShowFilters(false)}>Show {products.length} items</button>
        </aside>

        <section>
          {loading && <p className="center">Loading products...</p>}
          {!loading && products.length === 0 && (
            <div className="center">
              <h3>No products found</h3>
              <p className="small">Try removing some filters or search with a different word.</p>
              {hasFilters && <button className="btn" onClick={clearAll}>Clear all filters</button>}
            </div>
          )}
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
