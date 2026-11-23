const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { asyncHandler, createError } = require('../utils/helpers');

const getOrCreate = async (userId) => {
  let w = await Wishlist.findOne({ user: userId });
  if (!w) w = await Wishlist.create({ user: userId, products: [] });
  return w;
};

const send = async (res, id) => {
  res.json(await Wishlist.findById(id).populate({ path: 'products', populate: { path: 'category', select: 'name' } }));
};

// GET /api/wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const w = await getOrCreate(req.user._id);
  await send(res, w._id);
});

// POST /api/wishlist/:productId  (adds if not there, removes if already there)
exports.toggleWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw createError('Product not found', 404);

  const w = await getOrCreate(req.user._id);
  const index = w.products.findIndex((p) => p.toString() === req.params.productId);
  if (index > -1) w.products.splice(index, 1);
  else w.products.push(req.params.productId);

  await w.save();
  await send(res, w._id);
});
