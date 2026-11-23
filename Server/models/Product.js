const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    material: { type: String, default: '' },                 // material and fabric info
    details: [{ type: String }],                             // product detail points
    price: { type: Number, required: true, min: 0 },         // original price (MRP)
    discount: { type: Number, default: 0, min: 0, max: 90 }, // discount percentage
    salePrice: { type: Number, min: 0 },                     // selling (discount) price
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, default: '', trim: true },
    images: [{ type: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 4, min: 0, max: 5 },
    sold: { type: Number, default: 0 },                      // used for the Popularity sort
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// work out the selling price when it was not entered directly
productSchema.pre('validate', function (next) {
  const recalc =
    this.salePrice == null ||
    (!this.isModified('salePrice') && (this.isModified('price') || this.isModified('discount')));
  if (recalc) this.salePrice = Math.round(this.price - (this.price * (this.discount || 0)) / 100);
  next();
});

module.exports = mongoose.model('Product', productSchema);
