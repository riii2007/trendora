# Trendora - Discover Your Style.

A full-stack fashion e-commerce website built with the **MERN stack** (MongoDB, Express, React, Node).

## Folder Structure

```
Trendora/
├── Client/   -> Customer website (React + Vite)      http://localhost:5173
├── Admin/    -> Admin dashboard (React + Vite)       http://localhost:5174
└── Server/   -> Backend REST API (Node + Express)    http://localhost:5000
```

**Server/**: `config/` (db connection), `models/` (User, Product, Category, Cart, Wishlist, Order),
`controllers/` (logic), `routes/` (API endpoints), `middleware/` (JWT auth, image upload, errors), `seed.js` (sample data), `uploads/` (uploaded product images).

**Client/src/**: `pages/`, `components/` (Navbar, Footer, ProductCard, ProtectedRoute), `context/` (Auth + cart/wishlist state), `api.js`, `styles.css`.

**Admin/src/**: `pages/` (Login, Dashboard, Products, ProductForm, Categories, Orders, Users), `components/` (Layout, ProtectedRoute), `api.js`, `styles.css`.

## Requirements
- Node.js 18 or newer
- MongoDB running locally (MongoDB Community Server) **or** a free MongoDB Atlas connection string

## Installation and Running

Open 3 terminals.

### 1. Backend (Server)
```bash
cd Server
npm install
```
Edit `Server/.env` (a copy of `.env.example` is already provided):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/trendora
JWT_SECRET=put_a_long_random_secret_here
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```
Add the sample data (categories, 21 products, admin and test user):
```bash
npm run seed      # IMPORTANT: re-run this after updating, it loads the new categories and products
npm run dev
```
Check http://localhost:5000 - it should say "Trendora API is running".

### 2. Customer website (client)
```bash
cd Client
npm install
npm run dev
```
Open http://localhost:5173

### 3. Admin panel (admin)
```bash
cd Admin
npm install
npm run dev
```
Open http://localhost:5174

## Test Accounts (created by the seed script)
| Role  | Email                | Password |
|-------|----------------------|----------|
| Admin | admin@trendora.com   | admin123 |
| User  | user@trendora.com    | user123  |

Change the admin password before deploying anywhere public.
New customers can also register from the website. The admin role cannot be created from the website; only through the seed script/database.

## Features

**Customer site:** home page with banner and featured products, shop page with search + category filter + price sorting, product details with sizes, register/login, profile, cart (change quantity/remove), wishlist, checkout with delivery address (Cash on Delivery), my orders, responsive layout.

**Admin panel:** admin-only login, dashboard (products/customers/orders/revenue), add/edit/delete products with image upload, manage categories, view customers, view orders and update status (Pending, Processing, Shipped, Delivered).


## Shop Section (Version 3 - Myntra style layout)

**Top navigation:** Trendora logo, category menu (Men, Women, Kids, Accessories, Home & Living, Beauty) with a hover dropdown of subcategories, a search bar with suggestions, and Wishlist, Bag and Profile icons with live counts. On mobile it becomes a hamburger menu. The menu is built from the categories stored in MongoDB, so categories and subcategories added in the admin panel show up automatically.

**Product listing (`/shop`):**
- Category heading, breadcrumb and total number of products
- 4 products per row on desktop (3 on small laptops, 2 on tablet/mobile)
- Each card: image, rating, brand, product name, selling price, original price, discount %, wishlist heart
- Hover shows the second product image, and a **Quick Add** button (opens a size / colour chooser)
- Filters: Category (subcategory), Brand, Price range, Discount, Size, Colour, Rating, Availability. Several filters can be selected together and the products update immediately. Selected filters are shown as chips and can be removed one by one.
- Sorting: Recommended, What's New, Price Low to High, Price High to Low, Popularity, Highest Discount
- Filters are saved in the page URL, so refresh / back button / sharing the link keeps the same results

**Product details (`/product/:id`):** image gallery, brand, name, price, original price, discount %, size and colour selection, quantity, **delivery check by pincode** (real API call), product description, product details points, material and fabric, Add to Bag, Buy Now, Wishlist and Similar Products.

**Shopping bag (`/bag`):** product images and details, change size / colour / quantity, remove items, price details (total MRP, discount, delivery, total amount) and Proceed to Checkout.

**Wishlist (`/wishlist`):** saved in the database for the logged in user. Remove items, choose a size and **Move to Bag**.

**Admin panel:** add / edit / delete products with brand, category + subcategory, original price, discount and selling price (they update each other), sizes, colours, description, product details, material, stock, rating and multiple images (with preview). Categories page manages categories and their subcategories. New products appear in the shop immediately.

**Notes**
- Run `npm run seed` again after updating. The new product fields (brand, subcategory, material...) and the new categories are loaded by the seed (about 54 sample products).
- The pincode check uses a simple rule (zones by first digit, pincodes starting with 9 are not serviceable). A real project would use a courier API.
- Sample product images are Unsplash links. If one is missing, a grey placeholder shows, and you can upload your own image in the admin panel.
- Ratings are entered by the admin for now; customer reviews are part of the future scope.

## API Endpoints (for Postman)

Private routes need the header `Authorization: Bearer <token>` (token comes from the login response).

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register `{name,email,password}` |
| POST | /api/auth/login | Public | Login `{email,password}` |
| GET / PUT | /api/auth/profile | User | View / update profile |
| GET | /api/products?category=men&subcategory=T-Shirts&brand=A,B&size=M,L&color=Black&minPrice=&maxPrice=&discount=20&rating=4&inStock=true&search=&sort= | Public | List / filter / search products. `sort`: recommended, new, price_asc, price_desc, popularity, discount |
| GET | /api/products/filters?category=&search= | Public | Brands, sizes, colours, subcategories (with counts) for the filter sidebar |
| GET | /api/products/suggestions?q= | Public | Search box suggestions |
| GET | /api/products/:id/related | Public | Similar products |
| GET | /api/delivery/:pincode | Public | Delivery availability and date for a pincode |
| GET | /api/products/:id | Public | Single product |
| POST | /api/products | Admin | Add product (form-data, images field `images`) |
| PUT | /api/products/:id | Admin | Edit product |
| DELETE | /api/products/:id | Admin | Delete product |
| GET | /api/categories | Public | List categories |
| POST / PUT / DELETE | /api/categories(/:id) | Admin | Manage categories `{name, subcategories}` |
| GET | /api/cart | User | Get cart |
| POST | /api/cart | User | Add item `{productId,size,color,quantity}` |
| PUT / DELETE | /api/cart/:itemId | User | Change `{quantity}` / `{size}` / `{color}` / remove item |
| GET | /api/wishlist | User | Get wishlist |
| POST | /api/wishlist/:productId | User | Add or remove product from wishlist |
| POST | /api/orders | User | Place order from cart `{address:{fullName,phone,street,city,state,pincode}}` |
| GET | /api/orders/my | User | My orders |
| GET | /api/orders/:id | User/Admin | Single order |
| GET | /api/admin/stats | Admin | Dashboard numbers |
| GET | /api/admin/users | Admin | All customers |
| DELETE | /api/admin/users/:id | Admin | Delete a customer |
| GET | /api/admin/orders | Admin | All orders |
| PUT | /api/admin/orders/:id/status | Admin | Update status `{status}` |

## Security
- Passwords hashed with bcrypt.js (never stored as plain text)
- JWT authentication (7 day expiry), `protect` middleware on private routes
- `adminOnly` middleware checks the role on every admin route
- Secrets and DB URL are kept in `.env` (not committed)
- Input validation on register, login, products, address; image uploads limited to jpg/png/webp, 5MB

## Notes
- Sample products use online image links (Unsplash). If an image does not load, edit the product in the admin panel and upload your own image.
- To change the API address for the frontends, edit `VITE_API_URL` in `Client/.env` and `Admin/.env`.

## Future Scope
- Online payment gateway (Razorpay / Stripe)
- Email verification
- Order tracking
- Product reviews and ratings
- Product recommendations
# trendora
# trendora
