const mongoose = require('mongoose');

const slugify = (name) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, index: true },                // used in shop urls, e.g. /shop?category=men
    subcategories: [{ type: String, trim: true }],      // e.g. T-Shirts, Shirts, Jeans
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model('Category', categorySchema);
