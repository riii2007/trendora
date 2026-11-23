const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { asyncHandler, createError } = require('../utils/helpers');

// GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const [products, users, orders, recentOrders, delivered] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
    Order.find({ status: 'Delivered' }),
  ]);
  const revenue = delivered.reduce((sum, o) => sum + o.totalPrice, 0);
  res.json({ products, users, orders, revenue, recentOrders });
});

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  res.json(await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }));
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw createError('User not found', 404);
  if (user.role === 'admin') throw createError('Cannot delete an admin');
  await user.deleteOne();
  res.json({ message: 'User deleted' });
});

// GET /api/admin/orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }));
});

// PUT /api/admin/orders/:id/status   { status }
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Processing', 'Shipped', 'Delivered'].includes(status)) {
    throw createError('Invalid order status');
  }
  const order = await Order.findById(req.params.id);
  if (!order) throw createError('Order not found', 404);
  order.status = status;
  await order.save();
  res.json(order);
});
