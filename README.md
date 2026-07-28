# Nivana

**Curated Stays. Meaningful Experiences.**

A production-style MERN stack platform for premium Indian stays, wellness retreats, nature escapes, and experiential travel.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), React Router, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (httpOnly cookies), bcrypt |
| Images | Cloudinary |
| Deploy | Vercel (client), Render (server) |

## Project Structure

```
Nivana/
├── client/          # React + Vite frontend
└── server/          # Express API
```

## Getting Started

### Backend

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

npm install
npm run seed    # Optional: populate demo data
npm run dev     # http://localhost:5000
```

### Frontend

```bash
cd client
cp .env.example .env

npm install
npm run dev     # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000` so httpOnly cookies work in development.

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nivana.com | admin123 |
| User | priya@example.com | password123 |

### Create an admin account

There is **no public admin sign-up** (by design). Use one of these:

**Option A — Seed demo admin**
```bash
cd server && npm run seed
```
Log in at **http://localhost:5173/admin/login**

**Option B — Promote your existing account**
```bash
cd server
npm run make-admin you@example.com
```
Register first at `/register`, then run the command above.

## Security Features

- **httpOnly cookies** — JWT never exposed to JavaScript (XSS protection)
- **Token versioning** — logout increments `tokenVersion`, invalidating all existing sessions (prevents logout bypass)
- **Rate limiting** — general API limit + stricter auth endpoint limits
- **bcrypt** password hashing
- **Role-based authorization** for admin routes

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | User |
| GET | `/api/auth/profile` | User |

### Properties
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/properties` | Public |
| GET | `/api/properties/:id` | Public |
| POST | `/api/properties/upload-images` | Admin |
| POST | `/api/properties` | Admin |
| PUT | `/api/properties/:id` | Admin |
| DELETE | `/api/properties/:id` | Admin |

**Query params for listing:** `search`, `state`, `category`, `sort` (`price_asc`, `price_desc`, `rating_desc`, `newest`), `featured`, `page`, `limit`

### Bookings
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/bookings/availability/:propertyId` | Public |
| POST | `/api/bookings` | User |
| GET | `/api/bookings/user` | User |
| GET | `/api/bookings/admin` | Admin |
| PUT | `/api/bookings/:id` | User/Admin |
| DELETE | `/api/bookings/:id` | User/Admin |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/reviews/:propertyId` | Public |
| POST | `/api/reviews` | User (completed stay required) |
| PUT | `/api/reviews/:id` | User (owner) |
| DELETE | `/api/reviews/:id` | User (owner) / Admin |

### Wishlist
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/wishlist` | User |
| POST | `/api/wishlist` | User |
| DELETE | `/api/wishlist/:propertyId` | User |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/:id/role` | Admin |
| DELETE | `/api/admin/users/:id` | Admin |

## Development Phases

- [x] Phase 1 — Architecture & design
- [x] Phase 2 — Backend scaffold + auth + security
- [x] Phase 3 — Property + Booking APIs
- [x] Phase 4 — Review + Wishlist + Admin APIs
- [x] Phase 5 — Frontend scaffold + Home + Auth
- [x] Phase 6 — Public pages (Properties, Property Detail)
- [ ] Phase 7 — User features (Bookings, Wishlist, Profile)
- [ ] Phase 8 — Admin dashboard
- [ ] Phase 9 — Deployment

## License

ISC
