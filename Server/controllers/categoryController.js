const Category = require('../models/Category');
const Product = require('../models/Product');
const { asyncHandler, createError } = require('../utils/helpers');

// subcategories can come as an array or as "T-Shirts, Shirts, Jeans"
const toList = (v) => {
  const arr = Array.isArray(v) ? v : String(v || '').split(',');
  return [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
};

exports.getCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find().sort({ createdAt: 1 }));
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, subcategories } = req.body;
  if (!name || !name.trim()) throw createError('Category name is required');
  res.status(201).json(await Category.create({ name: name.trim(), subcategories: toList(subcategories) }));
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, subcategories } = req.body;
  if (!name || !name.trim()) throw createError('Category name is required');
  const cat = await Category.findById(req.params.id);
  if (!cat) throw createError('Category not found', 404);
  cat.name = name.trim();
  if (subcategories !== undefined) cat.subcategories = toList(subcategories);
  await cat.save();
  res.json(cat);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const used = await Product.countDocuments({ category: req.params.id });
  if (used > 0) throw createError('Cannot delete: products are using this category');
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) throw createError('Category not found', 404);
  res.json({ message: 'Category deleted' });
});
