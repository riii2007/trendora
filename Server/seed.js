// Run with:  npm run seed
// Adds categories (with subcategories), sample products, an admin user and a test user.
// NOTE: it deletes all existing categories and products first.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const img = (id) => `https://images.unsplash.com/${id}?w=700&q=80`;

const CATEGORIES = {
  Men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Shoes', 'Watches'],
  Women: ['Tops', 'Dresses', 'Kurtas', 'Jeans', 'Sarees', 'Handbags', 'Shoes'],
  Kids: ['Boys Clothing', 'Girls Clothing', 'Kids Shoes'],
  Accessories: ['Watches', 'Bags', 'Sunglasses', 'Jewellery'],
  'Home & Living': ['Bed Linen', 'Cushions & Covers', 'Wall Decor', 'Kitchen & Dining'],
  Beauty: ['Makeup', 'Skincare', 'Fragrances', 'Haircare'],
};

const CLOTHES = ['S', 'M', 'L', 'XL', 'XXL'];
const WAIST = ['28', '30', '32', '34', '36'];
const SHOES = ['6', '7', '8', '9', '10'];
const KIDS = ['2-3Y', '4-5Y', '6-7Y', '8-9Y'];
const FREE = ['Free Size'];

// every group: category, subcategory, sizes, image pool, material, description, details, items
// item = [brand, name, original price, discount %, colours]
const groups = [
  ['Men', 'T-Shirts', CLOTHES, ['photo-1521572163474-6864f9cf17ab', 'photo-1583743814966-8936f5b7be1a', 'photo-1576566588028-4147f3842f27'], '100% Cotton',
    'A soft and comfortable t-shirt that is perfect for daily wear and easy to style.', ['Regular fit', 'Round neck, short sleeves', 'Machine wash', 'Model height 6ft, wearing size M'],
    [['UrbanNest', 'Round Neck Cotton T-Shirt', 799, 25, 'White,Black,Grey'], ['Northline', 'Graphic Print T-Shirt', 999, 30, 'Black,Navy'], ['UrbanNest', 'Polo Neck T-Shirt', 1299, 40, 'Navy,Maroon,Green']]],
  ['Men', 'Shirts', CLOTHES, ['photo-1596755094514-f87e34085b2c', 'photo-1602810318383-e386cc2a3ccf', 'photo-1576566588028-4147f3842f27'], 'Cotton',
    'A stylish shirt for college, office and weekend outings.', ['Slim fit', 'Full sleeves, spread collar', 'Machine wash', 'Model height 6ft, wearing size M'],
    [['Northline', 'Slim Fit Check Shirt', 1499, 40, 'Blue,Red,Green'], ['Denim Co.', 'Casual Linen Shirt', 1799, 35, 'White,Beige'], ['UrbanNest', 'Formal Cotton Shirt', 1699, 30, 'White,Light Blue']]],
  ['Men', 'Jeans', WAIST, ['photo-1542272604-787c3835535d', 'photo-1541099649105-f69ad21f3246'], 'Cotton Stretch Denim',
    'Comfortable stretch jeans with a clean finish that goes with everything.', ['Mid rise', '5 pocket styling', 'Machine wash', 'Model height 6ft, wearing size 32'],
    [['Denim Co.', 'Slim Fit Stretch Jeans', 2499, 40, 'Dark Blue,Black'], ['Denim Co.', 'Relaxed Fit Jeans', 2199, 35, 'Light Blue']]],
  ['Men', 'Trousers', WAIST, ['photo-1473966968600-fa801b869a1a', 'photo-1624378439575-d8705ad7ae80'], 'Polyester Viscose Blend',
    'Smart trousers for formal and casual wear.', ['Regular fit', 'Flat front', 'Machine wash'],
    [['Northline', 'Formal Trousers', 1999, 45, 'Black,Grey,Navy'], ['UrbanNest', 'Cotton Chino Trousers', 1799, 30, 'Beige,Olive']]],
  ['Men', 'Jackets', CLOTHES, ['photo-1551028719-00167b16eac5', 'photo-1525507119028-ed4c629a60a3'], 'Faux Leather / Denim',
    'A stylish jacket to complete your winter look.', ['Zip front closure', 'Two side pockets', 'Dry clean only'],
    [['Northline', 'Faux Leather Biker Jacket', 4999, 50, 'Black,Brown'], ['Denim Co.', 'Classic Denim Jacket', 3299, 35, 'Blue']]],
  ['Men', 'Shoes', SHOES, ['photo-1542291026-7eec264c27ff', 'photo-1542060748-10c28b62716f', 'photo-1491553895911-0055eca6402d'], 'Mesh Upper, Rubber Sole',
    'Lightweight and comfortable shoes with a cushioned sole.', ['Lace up closure', 'Cushioned insole', 'Wipe with a clean cloth'],
    [['Strider', 'Men Running Shoes', 3499, 40, 'Red,Black'], ['Strider', 'Men White Sneakers', 2499, 30, 'White,Grey'], ['Strider', 'Men Training Shoes', 2999, 35, 'Blue,Black']]],
  ['Men', 'Watches', FREE, ['photo-1523275335684-37898b6baf30', 'photo-1546868871-7041f2a55e12', 'photo-1524592094714-0f0654e20314'], 'Stainless Steel Case',
    'A reliable watch that looks good with every outfit.', ['Water resistant up to 30m', '1 year warranty', 'Case diameter 42mm'],
    [['Zenith', 'Analog Leather Strap Watch', 3499, 50, 'Brown,Black'], ['Zenith', 'Smart Fitness Watch', 4999, 40, 'Black,Blue']]],

  ['Women', 'Tops', CLOTHES, ['photo-1434389677669-e08b4cac3105', 'photo-1620799140408-edc6dcb6d633', 'photo-1515886657613-9f3515b0c78f'], 'Rayon / Cotton Blend',
    'A trendy top that is light, comfortable and easy to pair.', ['Regular fit', 'Round neck', 'Machine wash'],
    [['Luna Label', 'Floral Print Top', 999, 40, 'Pink,Yellow,White'], ['Luna Label', 'Ribbed Knit Top', 899, 30, 'Beige,Black'], ['Aurelia', 'Casual Shirt Style Top', 1199, 35, 'Blue,White']]],
  ['Women', 'Dresses', CLOTHES, ['photo-1539109136881-3be0616acf4b', 'photo-1496747611176-843222e1e57c', 'photo-1515886657613-9f3515b0c78f'], 'Georgette / Polyester',
    'A beautiful dress for parties, brunches and special days.', ['Fit and flare', 'Fully lined', 'Hand wash'],
    [['Aurelia', 'Floral Midi Dress', 2499, 45, 'Blue,Pink'], ['Aurelia', 'Black Bodycon Dress', 2199, 40, 'Black,Maroon'], ['Luna Label', 'Summer Wrap Dress', 1999, 35, 'Yellow,Pink']]],
  ['Women', 'Kurtas', CLOTHES, ['photo-1610030469983-98e550d6193c', 'photo-1583391733956-6c78276477e2'], 'Pure Cotton',
    'A comfortable ethnic kurta for daily wear and festive days.', ['Straight fit', 'Calf length', 'Machine wash'],
    [['Aarav', 'Cotton Straight Kurta', 1299, 40, 'Blue,Mustard,Maroon'], ['Aarav', 'Embroidered Anarkali Kurta', 2299, 50, 'Green,Pink']]],
  ['Women', 'Jeans', WAIST, ['photo-1541099649105-f69ad21f3246', 'photo-1542272604-787c3835535d'], 'Cotton Stretch Denim',
    'Stretchable jeans with a perfect fit for all day comfort.', ['High rise', 'Stretchable', 'Machine wash'],
    [['Denim Co.', 'High Rise Skinny Jeans', 2299, 40, 'Blue,Black'], ['Denim Co.', 'Straight Fit Jeans', 1999, 30, 'Light Blue']]],
  ['Women', 'Sarees', FREE, ['photo-1610030469983-98e550d6193c', 'photo-1583391733956-6c78276477e2'], 'Silk Blend',
    'A graceful saree for weddings and festivals, comes with a blouse piece.', ['Saree length 5.5 m', 'Blouse piece included', 'Dry clean only'],
    [['Aarav', 'Silk Blend Saree', 3999, 55, 'Red,Green,Blue'], ['Aarav', 'Cotton Printed Saree', 1999, 40, 'Pink,Orange']]],
  ['Women', 'Handbags', FREE, ['photo-1584917865442-de89df76afd3', 'photo-1548036328-c9fa89d128fa'], 'Faux Leather',
    'A roomy and stylish handbag for everyday use.', ['Zip closure', '2 compartments', 'Detachable strap'],
    [['Bloom', 'Leather Look Tote Bag', 3299, 40, 'Tan,Black,Maroon'], ['Bloom', 'Mini Sling Bag', 1499, 35, 'Black,Pink']]],
  ['Women', 'Shoes', SHOES, ['photo-1560769629-975ec94e6a86', 'photo-1595950653106-6c9ebd614d3a'], 'Synthetic',
    'Comfortable footwear that looks good and feels good.', ['Cushioned footbed', 'Anti-skid sole', 'Wipe with a clean cloth'],
    [['Strider', 'Women Running Shoes', 2999, 40, 'Pink,White'], ['Strider', 'Block Heel Sandals', 1799, 45, 'Tan,Black']]],

  ['Kids', 'Boys Clothing', KIDS, ['photo-1503944583220-79d8926ad5e2', 'photo-1471286174890-9c112ffca5b4'], 'Soft Cotton',
    'Soft, easy to wash clothing made for playful kids.', ['Skin friendly', 'Machine wash'],
    [['Little Stars', 'Printed T-Shirt and Shorts Set', 1199, 40, 'Blue,Green'], ['Little Stars', 'Denim Dungaree', 1499, 35, 'Blue']]],
  ['Kids', 'Girls Clothing', KIDS, ['photo-1519238263530-99bdd11df2ea', 'photo-1503944583220-79d8926ad5e2'], 'Cotton Blend',
    'Pretty and comfortable outfits for little girls.', ['Skin friendly', 'Machine wash'],
    [['Little Stars', 'Floral Frock', 1299, 45, 'Pink,Yellow'], ['Little Stars', 'Party Wear Dress', 1999, 50, 'Red,Purple']]],
  ['Kids', 'Kids Shoes', KIDS, ['photo-1560769629-975ec94e6a86', 'photo-1542291026-7eec264c27ff'], 'Synthetic',
    'Durable and light shoes for active kids.', ['Velcro / lace closure', 'Non-slip sole'],
    [['Strider', 'Kids Velcro Sneakers', 1299, 40, 'Blue,Red'], ['Strider', 'Kids School Shoes', 1199, 30, 'Black']]],

  ['Accessories', 'Watches', FREE, ['photo-1524592094714-0f0654e20314', 'photo-1542496658-e33a6d0d50f6', 'photo-1523275335684-37898b6baf30'], 'Alloy Case',
    'A slim and stylish watch for everyday wear.', ['Water resistant', '1 year warranty'],
    [['Zenith', 'Minimal Dial Watch', 2499, 30, 'Silver,Gold'], ['Zenith', 'Chronograph Watch', 3999, 45, 'Black,Blue']]],
  ['Accessories', 'Bags', FREE, ['photo-1553062407-98eeb64c6a62', 'photo-1590874103328-eac38a683ce7'], 'Water Resistant Polyester',
    'A spacious bag with space for all your things.', ['Padded laptop section', 'Adjustable straps'],
    [['Craftly', 'Laptop Backpack', 1799, 40, 'Black,Grey,Navy'], ['Craftly', 'Canvas Sling Bag', 999, 30, 'Olive,Black']]],
  ['Accessories', 'Sunglasses', FREE, ['photo-1572635196237-14b3f281503f', 'photo-1511499767150-a48a237f0083'], 'Metal Frame, UV Protected Lens',
    'Stylish sunglasses with full UV protection.', ['100% UV protection', 'Lightweight frame'],
    [['Craftly', 'Aviator Sunglasses', 1299, 45, 'Black,Gold'], ['Craftly', 'Wayfarer Sunglasses', 999, 40, 'Black,Brown']]],
  ['Accessories', 'Jewellery', FREE, ['photo-1515562141207-7a88fb7ce338', 'photo-1535632066927-ab7c9ab60908', 'photo-1605100804763-247f67b3557e'], 'Brass with Gold Plating',
    'Pretty jewellery that adds shine to every outfit.', ['Skin friendly', 'Keep away from water and perfume'],
    [['Bloom', 'Gold Plated Necklace Set', 1599, 50, 'Gold'], ['Bloom', 'Hoop Earrings', 599, 30, 'Silver,Gold'], ['Bloom', 'Beaded Bracelet', 499, 20, 'Multi']]],

  ['Home & Living', 'Bed Linen', [], ['photo-1555041469-a586c61ea9bc', 'photo-1522708323590-d24dbb6b0267'], '100% Cotton',
    'Soft cotton bed linen for a good night sleep.', ['Double bed size', '1 bedsheet and 2 pillow covers', 'Machine wash'],
    [['Craftly', 'Cotton Double Bedsheet Set', 1999, 50, 'Blue,Grey']]],
  ['Home & Living', 'Cushions & Covers', [], ['photo-1522708323590-d24dbb6b0267', 'photo-1555041469-a586c61ea9bc'], 'Cotton Canvas',
    'Cushion covers that give your room a fresh new look.', ['Set of 2', 'Size 16 x 16 inches', 'Zip closure'],
    [['Craftly', 'Set of 2 Cushion Covers', 799, 40, 'Mustard,Teal']]],
  ['Home & Living', 'Wall Decor', [], ['photo-1522708323590-d24dbb6b0267', 'photo-1555041469-a586c61ea9bc'], 'Wood Frame',
    'A framed art print to decorate your walls.', ['Ready to hang', 'Size 12 x 18 inches'],
    [['Craftly', 'Framed Wall Art', 1499, 35, 'Black']]],

  ['Beauty', 'Makeup', [], ['photo-1596462502278-27bfdc403348', 'photo-1522335789203-aabd1fc54bc9'], 'Cruelty free formula',
    'Long lasting matte lipstick with rich colour.', ['Weight 4g', 'Vegan formula'],
    [['Bloom', 'Matte Lipstick', 599, 30, 'Red,Nude,Pink']]],
  ['Beauty', 'Skincare', [], ['photo-1522335789203-aabd1fc54bc9', 'photo-1596462502278-27bfdc403348'], 'Vitamin C, Hyaluronic Acid',
    'A face serum that gives your skin a natural glow.', ['Quantity 30ml', 'Suitable for all skin types'],
    [['Bloom', 'Vitamin C Face Serum', 899, 35, '']]],
  ['Beauty', 'Fragrances', [], ['photo-1596462502278-27bfdc403348', 'photo-1522335789203-aabd1fc54bc9'], 'Eau de Parfum',
    'A long lasting fragrance with fresh floral notes.', ['Quantity 100ml', 'Long lasting'],
    [['Aurelia', 'Eau de Parfum 100ml', 1999, 40, '']]],
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected, seeding...');

  await Promise.all([Category.deleteMany(), Product.deleteMany(),
    User.deleteMany({ email: { $in: ['admin@trendora.com', 'user@trendora.com'] } })]);

  await User.create({ name: 'Admin', email: 'admin@trendora.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Test User', email: 'user@trendora.com', password: 'user123' });

  const cats = {};
  for (const [name, subs] of Object.entries(CATEGORIES)) {
    cats[name] = (await Category.create({ name, subcategories: subs }))._id;
  }

  let n = 0;
  for (const [cat, sub, sizes, pool, material, description, details, items] of groups) {
    for (let k = 0; k < items.length; k++) {
      const [brand, name, price, discount, colors] = items[k];
      n++;
      await Product.create({
        name, brand, category: cats[cat], subcategory: sub, price, discount, material,
        description: `${name} by ${brand}. ${description}`,
        details: [`Material: ${material}`, ...details],
        images: [pool[k % pool.length], pool[(k + 1) % pool.length]].map(img),
        sizes, colors: colors ? colors.split(',') : [],
        stock: n % 19 === 0 ? 0 : 20 + (n % 30),                  // a few products are out of stock
        rating: Number((3.6 + ((n * 7) % 13) / 10).toFixed(1)),    // 3.6 - 4.8
        sold: 40 + ((n * 37) % 300),
        featured: k === 0,
      });
    }
  }

  console.log(`Done! ${Object.keys(CATEGORIES).length} categories and ${n} products added.`);
  console.log('Admin login: admin@trendora.com / admin123');
  console.log('User login:  user@trendora.com / user123');
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
