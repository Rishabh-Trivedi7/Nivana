# Nivana

> **Curated Stays. Meaningful Experiences.**

A production-style full-stack platform for premium Indian stays — wellness retreats, mountain escapes, heritage properties, tea estate experiences, and more. Built as a portfolio project demonstrating end-to-end MERN engineering.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 (Vite), React Router v6, Context API, Fetch API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JWT (httpOnly cookies), bcrypt, token versioning |
| Storage | Cloudinary (property images + avatars) |
| Deploy | Vercel (client) · Render (server) |

---

## Features

### 🏡 Properties
- Browse, search, filter by state / category / price / rating
- Featured properties on the home page
- Detailed property view with image gallery, amenities, reviews
- Dynamic Popular Regions — stay counts updated live from the database
- Availability calendar with blocked-date enforcement

### 🔐 Authentication
- Register / Login / Logout with httpOnly JWT cookies
- Role-based access: `user`, `host`, `admin`
- Token versioning — logout invalidates all sessions across devices
- Avatar upload + profile editing (name, email, phone, bio, password)

### 📅 Booking & Payments
- Date range selection with real-time server-side availability checks
- **Simulated payment gateway** (portfolio-safe, swap-ready for Razorpay/Stripe)
  - Payment methods: UPI · Credit Card · Debit Card · Net Banking
  - Server-side price calculation with 18% GST line item
  - Unique transaction IDs (`PAY_XXXXXXXX` / `TXN_YYYYMMDD_XXXXXX`)
  - 90% simulated success rate; graceful failure flow
- Booking confirmation, cancellation, status management
- Travel history (completed & cancelled stays) on the profile page

### 🔔 Notifications
- Host receives in-app notification on every confirmed booking
- Mark individual / all notifications as read

### ❤️ Wishlist
- Save and remove properties; persisted per user

### ⭐ Reviews
- Post reviews after completed stays only
- Edit or delete your own review; admin can delete any

### 🛠 Admin Dashboard
- Platform statistics (users, properties, bookings, revenue)
- User management — view, change role, delete
- Property management — create, edit, upload images, delete
- Booking management — view all, update status
- Review moderation

### 👤 Profile (Users & Hosts)
- View and edit personal details (name, email, phone, bio)
- Upload / change profile picture (Cloudinary)
- Travel history tab (all completed & cancelled bookings)
- **My Properties** tab — visible to hosts/admins only, shows all listed properties with ratings and pricing

---

## Project Structure

```
Nivana/
├── client/                     # React + Vite SPA
│   └── src/
│       ├── components/         # Reusable UI components
│       │   ├── common/         # Button, Input, Loader, Toast, etc.
│       │   ├── home/           # HeroSection, PopularDestinations, etc.
│       │   ├── booking/        # BookingModal, PaymentModal, etc.
│       │   ├── property/       # PropertyCard, ImageGallery, etc.
│       │   └── layout/         # Header, Footer, Navigation
│       ├── pages/              # Route-level page components
│       ├── services/           # API call wrappers (fetch)
│       ├── context/            # AuthContext
│       ├── constants/          # Destinations, categories, etc.
│       ├── hooks/              # Custom React hooks
│       ├── layouts/            # MainLayout, AuthLayout, AdminLayout
│       └── routes/             # AppRoutes (React Router config)
│
└── server/                     # Express REST API
    └── src/
        ├── models/             # Mongoose schemas
        │   ├── User.js
        │   ├── Property.js
        │   ├── Booking.js
        │   ├── Review.js
        │   └── Notification.js
        ├── controllers/        # Route handlers
        ├── services/           # Business logic layer
        │   ├── authService.js
        │   ├── bookingService.js
        │   ├── paymentService.js   ← isolated, swap-ready
        │   ├── notificationService.js
        │   ├── propertyService.js
        │   ├── reviewService.js
        │   ├── wishlistService.js
        │   └── cloudinaryService.js
        ├── routes/             # Express routers
        ├── middleware/         # Auth, RBAC, validation, rate-limit, upload
        ├── validators/         # express-validator rule sets
        ├── constants/          # Enums (roles, booking/payment status)
        ├── config/             # DB, CORS, cookie config
        └── utils/              # ApiError, ApiResponse, asyncHandler, token
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend

```bash
cd server
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* values

npm install
npm run seed    # Optional: seed demo properties + accounts
npm run dev     # http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.example .env
# Set VITE_API_URL if needed (defaults to /api via Vite proxy)

npm install
npm run dev     # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000`, so httpOnly cookies work seamlessly during development.

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nivana.com | admin123 |
| User | priya@example.com | password123 |

### Creating an Admin Account

**Option A — Seed script**
```bash
cd server && npm run seed
```
Log in at `http://localhost:5173/admin/login`

**Option B — Promote existing account**
```bash
cd server
npm run make-admin you@example.com
```
Register at `/register` first, then run the command above.

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/register` | Public |
| POST | `/login` | Public |
| POST | `/logout` | Authenticated |
| GET | `/profile` | Authenticated |
| PUT | `/profile` | Authenticated |
| POST | `/avatar` | Authenticated |

### Properties — `/api/properties`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | Public |
| GET | `/region-counts` | Public |
| GET | `/:id` | Public |
| POST | `/upload-images` | Admin |
| POST | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

**Query params:** `search`, `state`, `category`, `sort` (`price_asc` · `price_desc` · `rating_desc` · `newest`), `featured`, `ownerId`, `page`, `limit`

### Bookings — `/api/bookings`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/availability/:propertyId` | Public |
| POST | `/initiate-payment` | Authenticated |
| POST | `/` | Authenticated |
| GET | `/user` | Authenticated |
| GET | `/admin` | Admin |
| PUT | `/:id` | Authenticated |
| DELETE | `/:id` | Authenticated |

### Reviews — `/api/reviews`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/:propertyId` | Public |
| POST | `/` | Authenticated (completed stay required) |
| PUT | `/:id` | Review owner |
| DELETE | `/:id` | Review owner / Admin |

### Wishlist — `/api/wishlist`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | Authenticated |
| POST | `/` | Authenticated |
| DELETE | `/:propertyId` | Authenticated |

### Notifications — `/api/notifications`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | Authenticated |
| PUT | `/:id/read` | Authenticated |
| PUT | `/read-all` | Authenticated |

### Admin — `/api/admin`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/stats` | Admin |
| GET | `/users` | Admin |
| PUT | `/users/:id/role` | Admin |
| DELETE | `/users/:id` | Admin |

---

## Security

| Feature | Implementation |
|---------|---------------|
| XSS Protection | JWT in httpOnly cookies — never accessible to JS |
| Session Invalidation | Token versioning — logout increments `tokenVersion` |
| Password Security | bcrypt (salt rounds: 10) |
| Rate Limiting | General API limiter + stricter auth endpoint limiter |
| Authorization | Role-based middleware on every protected route |
| File Upload | Multer (memory storage) → Cloudinary; type + size validation |

---

## Payment Gateway (Simulated)

The payment flow is intentionally local and swap-ready:

- **`paymentService.js`** is the only file to replace when integrating a real gateway
- Supports UPI, Credit Card, Debit Card, Net Banking
- Price and GST calculated server-side (never trusted from client)
- Unique transaction IDs generated per booking
- On failure: booking is NOT created; user sees retry prompt

---

## Development Phases

- [x] Phase 1 — Architecture & design system
- [x] Phase 2 — Backend scaffold, auth, security
- [x] Phase 3 — Properties & Bookings API
- [x] Phase 4 — Reviews, Wishlist, Admin APIs
- [x] Phase 5 — Frontend scaffold, auth pages, home page
- [x] Phase 6 — Properties listing & detail pages
- [x] Phase 7 — Bookings, Wishlist, Profile (users & hosts)
- [x] Phase 8 — Admin dashboard (stats, users, properties, bookings, reviews)
- [x] Phase 9 — Payment gateway simulation
- [ ] Phase 10 — Production deployment (Vercel + Render)

---

## License

ISC
