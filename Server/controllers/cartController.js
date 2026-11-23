const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, createError } = require('../utils/helpers');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const sendCart = async (res, cartId) => {
  const cart = await Cart.findById(cartId)
    .populate('items.product', 'name brand price discount salePrice images stock sizes colors');
  res.json(cart);
};

// GET /api/cart
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await sendCart(res, cart._id);
});

// POST /api/cart   { productId, size, color, quantity }
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, size = '', color = '', quantity = 1 } = req.body;
  const qty = Number(quantity);
  if (!productId || qty < 1) throw createError('Valid product and quantity are required');

  const product = await Product.findById(productId);
  if (!product) throw createError('Product not found', 404);
  if (product.sizes.length > 0 && !product.sizes.includes(size)) throw createError('Please select a valid size');
  if (product.colors.length > 0 && !product.colors.includes(color)) throw createError('Please select a valid colour');
  if (product.stock < 1) throw createError('Product is out of stock');

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.product.toString() === productId && i.size === size && i.color === color);
  if (existing) existing.quantity = Math.min(existing.quantity + qty, product.stock);
  else cart.items.push({ product: productId, size, color, quantity: Math.min(qty, product.stock) });

  await cart.save();
  await sendCart(res, cart._id);
});

// PUT /api/cart/:itemId   { quantity?, size?, color? }
exports.updateItem = asyncHandler(async (req, res) => {
  const { quantity, size, color } = req.body;

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw createError('Bag item not found', 404);
  const product = await Product.findById(item.product);
  if (!product) throw createError('Product no longer available', 404);

  if (size !== undefined) {
    if (!product.sizes.includes(size)) throw createError('Please select a valid size');
    item.size = size;
  }
  if (color !== undefined) {
    if (!product.colors.includes(color)) throw createError('Please select a valid colour');
    item.color = color;
  }
  if (quantity !== undefined) {
    const qty = Number(quantity);
    if (!qty || qty < 1) throw createError('Quantity must be at least 1');
    item.quantity = Math.min(qty, product.stock);
  }

  // if the same product with the same size and colour is already in the bag, merge them
  const same = cart.items.find((i) => i._id.toString() !== req.params.itemId
    && i.product.toString() === item.product.toString() && i.size === item.size && i.color === item.color);
  if (same) {
    same.quantity = Math.min(same.quantity + item.quantity, product.stock);
    cart.items.pull(item._id);
  }

  await cart.save();
  await sendCart(res, cart._id);
});

// DELETE /api/cart/:itemId
exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  await sendCart(res, cart._id);
});
