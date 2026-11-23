const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler, createError } = require('../utils/helpers');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toList = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
const toBool = (v) => v === 'true' || v === true;

// category can be given as a slug (men) or as an id
const findCategoryId = async (value) => {
  if (/^[0-9a-fA-F]{24}$/.test(value)) return value;
  const cat = await Category.findOne({ slug: value });
  return cat ? cat._id : null;
};

// builds the MongoDB query from the url filters.
// Different filters are combined with AND, values inside one filter (brand=a,b) with OR.
// "skip" lists filters we ignore (used to build the filter sidebar counts).
const buildQuery = async (q, skip = []) => {
  const query = {};
  const use = (name) => !skip.includes(name);

  if (q.category) {
    const id = await findCategoryId(q.category);
    if (!id) return null;                       // unknown category -> no products
    query.category = id;
  }

  if (q.search && q.search.trim()) {
    const words = q.search.trim().split(/\s+/).slice(0, 6);
    query.$and = [];
    for (const w of words) {
      const re = { $regex: '\\b' + esc(w), $options: 'i' };    // match start of a word
      const cats = await Category.find({ name: re }).select('_id');
      query.$and.push({
        $or: [
          { name: re }, { brand: re }, { subcategory: re }, { description: re }, { material: re },
          { category: { $in: cats.map((c) => c._id) } },
        ],
      });
    }
  }

  if (use('subcategory') && q.subcategory) query.subcategory = { $in: toList(q.subcategory) };
  if (use('brand') && q.brand) query.brand = { $in: toList(q.brand) };
  if (use('size') && q.size) query.sizes = { $in: toList(q.size) };
  if (use('color') && q.color) query.colors = { $in: toList(q.color) };
  if (use('price') && (q.minPrice || q.maxPrice)) {
    query.salePrice = {};
    if (q.minPrice) query.salePrice.$gte = Number(q.minPrice);
    if (q.maxPrice) query.salePrice.$lte = Number(q.maxPrice);
  }
  if (use('discount') && q.discount) query.discount = { $gte: Number(q.discount) };
  if (use('rating') && q.rating) query.rating = { $gte: Number(q.rating) };
  if (use('inStock') && toBool(q.inStock)) query.stock = { $gt: 0 };
  if (q.featured === 'true') query.featured = true;
  return query;
};

const SORTS = {
  recommended: { featured: -1, rating: -1, sold: -1 },
  new: { createdAt: -1 },
  newest: { createdAt: -1 },
  price_asc: { salePrice: 1 },
  price_desc: { salePrice: -1 },
  popularity: { sold: -1, rating: -1 },
  discount: { discount: -1, rating: -1 },
};

// GET /api/products?category=&subcategory=&brand=&size=&color=&minPrice=&maxPrice=&discount=&rating=&inStock=&search=&sort=
exports.getProducts = asyncHandler(async (req, res) => {
  const query = await buildQuery(req.query);
  if (!query) return res.json([]);
  const sort = SORTS[req.query.sort] || SORTS.recommended;
  res.json(await Product.find(query).populate('category', 'name slug').sort(sort));
});

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const sizeSort = (a, b) => {
  const ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b);
  if (ia > -1 && ib > -1) return ia - ib;
  if (ia > -1) return -1;
  if (ib > -1) return 1;
  return a.localeCompare(b, undefined, { numeric: true });
};

// GET /api/products/filters?category=&search=
// returns the values that can be used in the filter sidebar (with product counts)
exports.getFilters = asyncHandler(async (req, res) => {
  const query = await buildQuery({ category: req.query.category, search: req.query.search });
  const empty = { total: 0, subcategories: [], brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } };
  if (!query) return res.json(empty);

  const products = await Product.find(query).select('brand subcategory sizes colors salePrice');
  const count = (values) => {
    const map = {};
    values.filter(Boolean).forEach((v) => { map[v] = (map[v] || 0) + 1; });
    return Object.keys(map).sort().map((name) => ({ name, count: map[name] }));
  };

  const prices = products.map((p) => p.salePrice);
  res.json({
    total: products.length,
    subcategories: count(products.map((p) => p.subcategory)),
    brands: count(products.map((p) => p.brand)),
    colors: count(products.flatMap((p) => p.colors)),
    sizes: [...new Set(products.flatMap((p) => p.sizes))].sort(sizeSort),
    priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
  });
});

// GET /api/products/suggestions?q=  -> for the search box drop down
exports.getSuggestions = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json([]);
  const re = { $regex: '\\b' + esc(q), $options: 'i' };
  const products = await Product.find({ $or: [{ name: re }, { brand: re }, { subcategory: re }] })
    .select('name brand').limit(6);
  res.json(products);
});

// GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) throw createError('Product not found', 404);
  res.json(product);
});

// GET /api/products/:id/related  -> similar products (same subcategory first, then same category)
exports.getRelated = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw createError('Product not found', 404);

  const taken = [product._id];
  let related = await Product.find({ _id: { $nin: taken }, category: product.category, subcategory: product.subcategory })
    .populate('category', 'name slug').sort({ rating: -1 }).limit(8);
  taken.push(...related.map((p) => p._id));

  if (related.length < 8) {
    const more = await Product.find({ _id: { $nin: taken }, category: product.category })
      .populate('category', 'name slug').sort({ rating: -1 }).limit(8 - related.length);
    related = related.concat(more);
  }
  res.json(related);
});

// checks the numbers sent by the admin form
const validateNumbers = ({ price, discount, salePrice, rating, stock }) => {
  if (price !== undefined && (isNaN(price) || Number(price) <= 0)) throw createError('Original price must be greater than 0');
  if (discount !== undefined && discount !== '' && (isNaN(discount) || Number(discount) < 0 || Number(discount) > 90)) {
    throw createError('Discount must be between 0 and 90 percent');
  }
  if (salePrice !== undefined && salePrice !== '') {
    if (isNaN(salePrice) || Number(salePrice) <= 0) throw createError('Selling price must be greater than 0');
    if (price !== undefined && Number(salePrice) > Number(price)) throw createError('Selling price cannot be more than the original price');
  }
  if (rating !== undefined && rating !== '' && (isNaN(rating) || Number(rating) < 0 || Number(rating) > 5)) {
    throw createError('Rating must be between 0 and 5');
  }
  if (stock !== undefined && stock !== '' && (isNaN(stock) || Number(stock) < 0)) throw createError('Stock cannot be negative');
};

const checkCategory = async (categoryId, subcategory) => {
  const cat = await Category.findById(categoryId);
  if (!cat) throw createError('Selected category does not exist');
  if (cat.subcategories.length > 0 && !cat.subcategories.includes(subcategory)) {
    throw createError('Please select a valid subcategory');
  }
};

// POST /api/products (admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.name || !b.brand || !b.description || !b.price || !b.category) {
    throw createError('Name, brand, description, price and category are required');
  }
  validateNumbers(b);
  await checkCategory(b.category, b.subcategory);

  const price = Number(b.price);
  const data = {
    name: b.name, brand: b.brand, description: b.description, material: b.material || '',
    details: String(b.details || '').split('\n').map((s) => s.trim()).filter(Boolean),
    price, category: b.category, subcategory: b.subcategory || '',
    images: (req.files || []).map((f) => '/uploads/' + f.filename),
    sizes: toList(b.sizes), colors: toList(b.colors), stock: Number(b.stock) || 0,
    rating: b.rating === undefined || b.rating === '' ? 4 : Number(b.rating), featured: toBool(b.featured),
    discount: Number(b.discount) || 0,
  };
  // selling price entered directly -> work out the discount percentage from it
  if (b.salePrice !== undefined && b.salePrice !== '') {
    data.salePrice = Number(b.salePrice);
    data.discount = Math.round(((price - data.salePrice) / price) * 100);
  }
  res.status(201).json(await Product.create(data));
});

// PUT /api/products/:id (admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw createError('Product not found', 404);

  const b = req.body;
  validateNumbers(b);
  await checkCategory(b.category || product.category, b.category ? b.subcategory : (b.subcategory ?? product.subcategory));

  if (b.name) product.name = b.name;
  if (b.brand) product.brand = b.brand;
  if (b.description) product.description = b.description;
  if (b.material !== undefined) product.material = b.material;
  if (b.details !== undefined) product.details = String(b.details).split('\n').map((s) => s.trim()).filter(Boolean);
  if (b.price !== undefined && b.price !== '') product.price = Number(b.price);
  if (b.category) product.category = b.category;
  if (b.subcategory !== undefined) product.subcategory = b.subcategory;
  if (b.sizes !== undefined) product.sizes = toList(b.sizes);
  if (b.colors !== undefined) product.colors = toList(b.colors);
  if (b.stock !== undefined && b.stock !== '') product.stock = Number(b.stock);
  if (b.rating !== undefined && b.rating !== '') product.rating = Number(b.rating);
  if (b.featured !== undefined) product.featured = toBool(b.featured);

  if (b.salePrice !== undefined && b.salePrice !== '') {
    product.salePrice = Number(b.salePrice);
    product.discount = Math.round(((product.price - product.salePrice) / product.price) * 100);
  } else if (b.discount !== undefined && b.discount !== '') {
    product.discount = Number(b.discount);
  }

  // keepImages = old images the admin did not remove
  let oldImages = product.images;
  if (b.keepImages) {
    try { oldImages = JSON.parse(b.keepImages); } catch (e) { /* ignore */ }
  }
  product.images = [...oldImages, ...(req.files || []).map((f) => '/uploads/' + f.filename)];

  await product.save();
  res.json(product);
});

// DELETE /api/products/:id (admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw createError('Product not found', 404);
  res.json({ message: 'Product deleted' });
});
