# 💊 PharmaEZ — Pharmacy & Healthcare E-Commerce Platform

A full-featured MERN Stack (MongoDB, Express.js, React.js, Node.js) e-commerce application for a pharmacy and healthcare store.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Seeding Sample Data](#seeding-sample-data)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Application Modules](#application-modules)
- [Admin Dashboard](#admin-dashboard)
- [Deployment](#deployment)

---

## ✅ Features

### Customer Features
- 🔐 User registration, login, and JWT authentication
- 🛍️ Browse products by categories and subcategories
- 🔍 Full-text search with filters (category, price, prescription required)
- 🛒 Shopping cart with quantity management
- ❤️ Wishlist management
- 💳 Multi-step checkout with address selection
- 💊 Prescription upload and verification workflow
- 📦 Order tracking with real-time status updates
- ⭐ Product reviews and ratings system
- 🎁 Loyalty points system (1 point per ₹10 spent)
- 📍 Multiple delivery addresses management
- 👤 Personal profile management

### Admin Features
- 📊 Analytics dashboard with revenue charts
- 📦 Complete order management with status updates
- 💊 Product catalogue management (CRUD)
- 👥 User account management
- 📋 Prescription review and approval workflow
- 🏭 Inventory monitoring with low-stock alerts
- 📈 Sales and revenue reporting

### Healthcare-Specific Features
- Prescription (Rx) required flag on medicines
- Salt/generic name tracking
- Dosage form and strength information
- Side effects and usage instructions
- Batch number and expiry date management
- Prescription upload and pharmacist review workflow
- Medicine categories: OTC, Prescription, Vitamins, Medical Devices, Baby Care, etc.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18, React Router v6, Context API |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs |
| **File Upload** | Multer |
| **Styling** | Custom CSS with CSS Variables |
| **HTTP Client** | Axios |
| **Icons** | React Icons (Feather Icons) |
| **Toast Notifications** | React Hot Toast |
| **Build Tool** | Vite |

---

## 📁 Project Structure

```
pharmaez/
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Auth, profile, addresses, prescriptions
│   │   ├── productController.js# Products, reviews
│   │   ├── cartController.js   # Shopping cart
│   │   ├── orderController.js  # Orders, admin stats
│   │   └── adminController.js  # Admin: users, prescriptions, config
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + adminOnly + generateToken
│   │   └── errorHandler.js     # Global error handler + 404
│   ├── models/
│   │   ├── User.js             # User schema (addresses, prescriptions, wishlist)
│   │   ├── Product.js          # Product schema (medical fields, reviews)
│   │   ├── Cart.js             # Cart schema
│   │   ├── Order.js            # Order schema (status history, prescription)
│   │   └── AdminConfig.js      # Banners, settings
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── seeder.js           # Database seeder
│   ├── uploads/                # Uploaded prescription files
│   ├── .env.example
│   ├── index.js                # Express server entry point
│   └── package.json
│
└── client/                     # Frontend (React.js + Vite)
    ├── src/
    │   ├── assets/styles/
    │   │   ├── global.css      # Global styles, utilities, CSS variables
    │   │   └── components.css  # Shared component styles
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── AdminLayout.jsx  # Admin sidebar layout
    │   │   │   └── AdminLayout.css
    │   │   ├── common/
    │   │   │   ├── ProductCard.jsx  # Reusable product card
    │   │   │   └── ProductCard.css
    │   │   └── layout/
    │   │       ├── Navbar.jsx   # Responsive navigation + search
    │   │       ├── Navbar.css
    │   │       ├── Footer.jsx
    │   │       └── Footer.css
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Global auth state
    │   │   └── CartContext.jsx  # Global cart state
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminProducts.jsx
    │   │   │   ├── AdminProductForm.jsx
    │   │   │   ├── AdminOrders.jsx
    │   │   │   ├── AdminUsers.jsx
    │   │   │   ├── AdminInventory.jsx
    │   │   │   ├── AdminPrescriptions.jsx
    │   │   │   └── AdminPages.css
    │   │   ├── auth/
    │   │   │   ├── AuthPages.jsx  (LoginPage + RegisterPage)
    │   │   │   ├── LoginPage.jsx
    │   │   │   ├── RegisterPage.jsx
    │   │   │   └── AuthPages.css
    │   │   ├── user/
    │   │   │   ├── UserDashboard.jsx
    │   │   │   ├── OrdersPage.jsx
    │   │   │   ├── OrderDetailPage.jsx
    │   │   │   ├── WishlistPage.jsx
    │   │   │   ├── PrescriptionsPage.jsx
    │   │   │   ├── ProfilePage.jsx
    │   │   │   └── UserPages.css
    │   │   ├── HomePage.jsx         # Hero, categories, featured
    │   │   ├── HomePage.css
    │   │   ├── ProductsPage.jsx     # Listing with filters/pagination
    │   │   ├── ProductsPage.css
    │   │   ├── ProductDetailPage.jsx # Detail, tabs, reviews
    │   │   ├── ProductDetailPage.css
    │   │   ├── CartPage.jsx
    │   │   ├── CartPage.css
    │   │   ├── CheckoutPage.jsx     # 3-step checkout
    │   │   ├── CheckoutPage.css
    │   │   └── OrderConfirmationPage.jsx
    │   ├── utils/
    │   │   └── api.js          # Axios instance with interceptors
    │   ├── App.jsx             # Routes + providers
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v6 or higher (local or MongoDB Atlas)
- **npm** or **yarn**

---

## 🚀 Installation & Setup

### 1. Clone / Download the Project

```bash
cd pharmaez
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables)).

### 3. Frontend Setup

```bash
cd ../client
npm install
```

---

## 🔧 Environment Variables

Create `server/.env` with these values:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/pharmaez
JWT_SECRET=pharmaez_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### For MongoDB Atlas (Cloud):
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pharmaez?retryWrites=true&w=majority
```

---

## 🌱 Seeding Sample Data

After setting up your `.env`, run the seeder to populate the database with:
- 1 Admin user
- 1 Sample customer
- 12 Healthcare products across all categories

```bash
cd server
npm run seed
```

**Default login credentials after seeding:**

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@pharmaez.com | admin123 |
| User  | raj@example.com | user123 |

---

## ▶️ Running the Application

### Development Mode (recommended — runs both frontend and backend)

**Terminal 1 — Backend:**
```bash
cd server
npm run dev       # Uses nodemon for hot-reload
# Server starts at http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev       # Vite dev server with HMR
# App starts at http://localhost:5173
```

Open your browser at **http://localhost:5173**

### Production Build

```bash
# Build frontend
cd client
npm run build
# dist/ folder is created

# Start backend in production
cd ../server
NODE_ENV=production npm start
```

---

## 📡 API Documentation

Base URL: `http://localhost:8000/api`

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login and get JWT token |
| GET | `/auth/profile` | Private | Get user profile + wishlist |
| PUT | `/auth/profile` | Private | Update profile |
| PUT | `/auth/change-password` | Private | Change password |
| POST | `/auth/address` | Private | Add delivery address |
| DELETE | `/auth/address/:id` | Private | Delete delivery address |
| POST | `/auth/wishlist/:productId` | Private | Toggle product in wishlist |
| POST | `/auth/prescription` | Private | Upload prescription (multipart) |

### Product Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/products` | Public | List with filters: `keyword`, `category`, `subcategory`, `minPrice`, `maxPrice`, `prescriptionRequired`, `sort`, `page`, `limit` |
| GET | `/products/featured` | Public | Featured products |
| GET | `/products/category/:category` | Public | Products by category |
| GET | `/products/:id` | Public | Single product |
| POST | `/products/:id/reviews` | Private | Add review |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

### Cart Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/cart` | Private | Get user's cart |
| POST | `/cart` | Private | Add item `{ productId, quantity }` |
| PUT | `/cart/:itemId` | Private | Update item quantity |
| DELETE | `/cart/:itemId` | Private | Remove item |
| DELETE | `/cart` | Private | Clear entire cart |

### Order Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/orders` | Private | Place order |
| GET | `/orders/my` | Private | Get user's orders |
| GET | `/orders/:id` | Private | Get order by ID |
| PUT | `/orders/:id/cancel` | Private | Cancel order |
| GET | `/orders/admin/stats` | Admin | Dashboard statistics |
| GET | `/orders/admin/all` | Admin | All orders with filters |
| PUT | `/orders/admin/:id/status` | Admin | Update order status |

### Admin Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin/users` | Admin | All users with pagination |
| PUT | `/admin/users/:id/toggle` | Admin | Toggle user active status |
| GET | `/admin/prescriptions` | Admin | All uploaded prescriptions |
| PUT | `/admin/prescriptions/:userId/:prescriptionId` | Admin | Approve/reject prescription |
| GET | `/admin/config` | Public | Get store configuration |
| PUT | `/admin/config` | Admin | Update store configuration |
| GET | `/admin/inventory` | Admin | Inventory report |

### Health Check
```
GET /api/health
```

---

## 🗄️ Database Schema

### User
```
name, email (unique), password (hashed), phone, dateOfBirth, gender
addresses: [{ fullName, phone, street, city, state, pincode, isDefault }]
prescriptions: [{ fileName, fileUrl, uploadedAt, status, doctorName, notes }]
wishlist: [ObjectId → Product]
isActive, role (user|admin), loyaltyPoints
```

### Product
```
name, genericName, description, manufacturer
category (enum: 10 categories), subcategory
images: [String], price, discountPrice, discountPercent
stock, unit, packSize, prescriptionRequired
saltComposition, dosageForm, strength
sideEffects: [String], usageInstructions, storageInstructions
expiryDate, batchNumber, isAvailable, isFeatured
reviews: [{ user, name, rating, comment }]
rating, numReviews, tags: [String]
```

### Cart
```
user: ObjectId → User
items: [{ product, name, image, price, discountPrice, quantity, prescriptionRequired, packSize }]
couponCode, discount
virtuals: totalItems, subtotal
```

### Order
```
user: ObjectId → User
orderNumber (auto-generated, e.g. PEZ7829430001)
items: [{ product, name, image, price, quantity, packSize, prescriptionRequired }]
shippingAddress: { fullName, phone, street, city, state, pincode }
paymentMethod (cod|upi|card|netbanking|wallet)
paymentStatus (pending|paid|failed|refunded)
itemsPrice, shippingPrice, taxPrice, discountAmount, totalPrice
orderStatus (placed|confirmed|processing|shipped|delivered|cancelled|returned)
prescriptionStatus (not_required|pending|approved|rejected)
statusHistory: [{ status, timestamp, note }]
estimatedDelivery, deliveredAt, notes, couponCode
```

---

## 🏥 Application Modules

### 1. Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (user / admin)
- Protected and admin-only routes
- Password hashing with bcryptjs (salt rounds: 10)

### 2. Product Management
- 10 healthcare categories
- Full-text search across name, genericName, and tags
- Advanced filtering (price range, category, prescription required)
- Sort by price, rating, newest, relevance
- Pagination (12 per page by default)
- Product reviews with rating aggregation

### 3. Prescription Workflow
1. Customer uploads prescription (image/PDF)
2. System flags order as "prescription pending"
3. Admin reviews prescription in dashboard
4. Admin approves or rejects with notes
5. Order proceeds or is cancelled

### 4. Cart & Checkout
- Real-time stock validation
- Prevents overselling
- Free shipping threshold (₹499)
- GST calculation (5%)
- 3-step checkout: Address → Payment → Review
- Multiple saved addresses

### 5. Order Management
- Auto-generated order numbers (PEZ + timestamp + sequence)
- Status progression: placed → confirmed → processing → shipped → delivered
- Status history audit trail
- Stock auto-deduction on order placement
- Stock restoration on cancellation
- Loyalty points awarded automatically (1 point per ₹10)

---

## 🎛️ Admin Dashboard

Access at `/admin` after logging in with admin credentials.

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin` | KPIs, revenue chart, recent orders, low stock |
| Products | `/admin/products` | List, search, edit, delete products |
| Add/Edit Product | `/admin/products/new` | Full product creation form |
| Orders | `/admin/orders` | All orders, status updates, detail panel |
| Users | `/admin/users` | User list, activate/deactivate |
| Inventory | `/admin/inventory` | Stock overview, low-stock alerts |
| Prescriptions | `/admin/prescriptions` | Review, approve, reject prescriptions |

---

## 🚢 Deployment

### Backend (e.g., Railway, Render, Heroku)

1. Set environment variables on your platform
2. Set `MONGO_URI` to your MongoDB Atlas connection string
3. Set `NODE_ENV=production`
4. Start command: `node index.js`

### Frontend (e.g., Vercel, Netlify)

1. Build: `npm run build`
2. Publish directory: `dist`
3. Set the `VITE_API_URL` if you move away from the proxy approach

### Full Stack on Single Server

Build the React app and serve it from Express:

```javascript
// Add to server/index.js for production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
  });
}
```

---

## 🔒 Security Notes

- Change `JWT_SECRET` to a strong random string in production
- Enable HTTPS in production
- Configure CORS to only allow your frontend domain
- Add rate limiting (express-rate-limit) for production
- Validate and sanitize all inputs
- Never commit `.env` to version control

---

## 📝 License

This project is for educational purposes. Built with the MERN stack.

---

## 👨‍💻 Tech Credits

- React.js, Node.js, Express.js, MongoDB, Mongoose
- React Router v6, React Hot Toast, React Icons
- Axios, Multer, bcryptjs, jsonwebtoken
- Vite (build tool)
