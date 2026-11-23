const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // products created before the discount feature get salePrice = price
    const Product = require('../models/Product');
    // categories from older versions get a slug
    const Category = require('../models/Category');
    for (const c of await Category.find({ slug: { $exists: false } })) await c.save();

    await Product.updateMany({ salePrice: { $exists: false } }, [{ $set: { salePrice: '$price', discount: 0 } }]);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
