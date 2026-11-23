const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, createError } = require('../utils/helpers');

// POST /api/orders   { address }   -> creates an order from the user's cart
exports.createOrder = asyncHandler(async (req, res) => {
  const { address } = req.body;
  const required = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
  if (!address || required.some((f) => !address[f] || !String(address[f]).trim())) {
    throw createError('Please fill all delivery address fields');
  }
  if (!/^\d{10}$/.test(address.phone)) throw createError('Phone number must be 10 digits');
  if (!/^\d{6}$/.test(address.pincode)) throw createError('Pincode must be 6 digits');

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const validItems = cart ? cart.items.filter((i) => i.product) : [];
  if (validItems.length === 0) throw createError('Your cart is empty');

  let totalPrice = 0;
  const items = validItems.map((i) => {
    if (i.product.stock < i.quantity) throw createError(`Not enough stock for ${i.product.name}`);
    totalPrice += i.product.salePrice * i.quantity;
    return {
      product: i.product._id, name: i.product.name, brand: i.product.brand, image: i.product.images[0] || '',
      price: i.product.salePrice, size: i.size, color: i.color, quantity: i.quantity,
    };
  });

  const order = await Order.create({
    user: req.user._id, items, address, paymentMethod: 'Cash on Delivery', totalPrice,
  });

  // reduce stock and empty the cart
  for (const i of validItems) {
    await Product.updateOne({ _id: i.product._id }, { $inc: { stock: -i.quantity, sold: i.quantity } });
  }
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// GET /api/orders/my
exports.getMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

// GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw createError('Order not found', 404);
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw createError('Not allowed to view this order', 403);
  }
  res.json(order);
});
