# Nivana — System Design

> **Curated Stays. Meaningful Experiences.**
> A production-style MERN stack experiential travel platform.

---

## 1. Overview

Nivana is a full-stack web application that enables travellers to discover, book, and review premium curated stays across India. It is not a generic hotel aggregator — it focuses on a specific niche: wellness retreats, mountain escapes, heritage properties, riverside stays, tea estate experiences, and luxury villas.

The platform supports three user roles:

| Role | Capabilities |
|------|-------------|
| `user` | Browse, search, book, pay, review, wishlist, manage profile |
| `host` | All user capabilities + view their listed properties |
| `admin` | Full control: manage users, properties, bookings, reviews; view analytics |

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                  │
│  Vite · React Router v6 · Context API · Fetch API         │
└────────────────────────────┬───────────────────────────────┘
                             │ HTTPS (httpOnly cookie + JSON)
                             │ /api/*  (proxied in dev)
┌────────────────────────────▼───────────────────────────────┐
│                       SERVER (Express)                     │
│  Routes → Middleware → Controllers → Services → Models     │
└──────┬─────────────────────────────────────┬───────────────┘
       │                                     │
┌──────▼──────┐                    ┌─────────▼──────────┐
│  MongoDB    │                    │    Cloudinary CDN  │
│  Atlas      │                    │  (images, avatars) │
└─────────────┘                    └────────────────────┘
```

**Key design choices:**
- Single-page application with client-side routing; no SSR
- REST API (not GraphQL) — simpler for portfolio; each resource has a dedicated router
- Stateless JWT auth stored in httpOnly cookies (not localStorage) for XSS resistance
- Service layer between controllers and models — business logic is never in controllers or routes

---

## 3. Database Design

### 3.1 Collections

#### `users`
```
_id          ObjectId
fullName     String  (max 100)
email        String  (unique, lowercase)
password     String  (bcrypt, select: false)
role         Enum    ['user', 'host', 'admin']
avatar       String  (Cloudinary URL)
phone        String
bio          String  (max 500)
wishlist     [ObjectId → properties]
tokenVersion Number  (incremented on logout/password-change)
timestamps   createdAt, updatedAt
```

#### `properties`
```
_id            ObjectId
ownerId        ObjectId → users
title          String  (max 150)
location       String
state          String  (indexed)
category       Enum    [wellness, mountain, heritage, ...]
description    String  (max 5000)
pricePerNight  Number
amenities      [String]
images         [String]  (Cloudinary URLs)
featured       Boolean   (indexed)
averageRating  Number    (0–5, denormalized)
totalReviews   Number    (denormalized)
blockedDates   [{checkInDate, checkOutDate}]
timestamps     createdAt, updatedAt

Indexes: category+state, featured, pricePerNight, averageRating, text(title+location+description)
```

#### `bookings`
```
_id            ObjectId
userId         ObjectId → users
propertyId     ObjectId → properties
checkInDate    Date
checkOutDate   Date
totalPrice     Number  (subtotal + tax)
bookingStatus  Enum    [pending, confirmed, cancelled, completed]
transactionId  String  (PAY_XXXXXXXX | TXN_YYYYMMDD_XXXXXX)
paymentStatus  Enum    [pending, paid, failed]
paymentMethod  Enum    [upi, credit_card, debit_card, net_banking]
amountPaid     Number
taxAmount      Number  (18% GST)
paymentDate    Date
timestamps     createdAt, updatedAt

Indexes: propertyId+checkInDate+checkOutDate, userId+createdAt
```

#### `reviews`
```
_id         ObjectId
userId      ObjectId → users
propertyId  ObjectId → properties
rating      Number  (1–5)
comment     String  (max 1000)
timestamps  createdAt, updatedAt

Unique compound index: userId + propertyId (one review per stay)
```

#### `notifications`
```
_id          ObjectId
recipientId  ObjectId → users
type         Enum  [NEW_BOOKING, BOOKING_CANCELLED, GENERAL]
title        String
message      String
metadata     Mixed  (bookingId, guestName, amount, etc.)
isRead       Boolean  (default false)
timestamps   createdAt, updatedAt

Indexes: recipientId+createdAt, recipientId+isRead
```

### 3.2 Denormalization Decisions

- `averageRating` and `totalReviews` are stored on the `Property` document and updated atomically whenever a review is created/updated/deleted — avoids expensive aggregation queries on every property list load.
- `blockedDates` embedded in `Property` — enables fast availability checks without joining bookings. Updated synchronously when a booking is confirmed.

---

## 4. Server Architecture

### 4.1 Layer Responsibilities

```
Request
  │
  ▼
authMiddleware (JWT verify, attach req.user)
  │
roleMiddleware (RBAC — admin only, host only, etc.)
  │
validateMiddleware (express-validator, short-circuits on errors)
  │
Controller (extracts params, calls service, sends ApiResponse)
  │
Service (all business logic: checks, calculations, DB ops)
  │
Model (Mongoose schema, hooks, methods)
```

**Controllers are thin.** They never query the database directly.  
**Services are pure.** They throw `ApiError` on failure; the global `errorHandler` middleware converts them to JSON.

### 4.2 Middleware Stack (in order)

| Middleware | Purpose |
|-----------|---------|
| `cors` | Cross-origin requests, credential support |
| `express.json` (10 MB limit) | JSON body parsing |
| `cookieParser` | Parse httpOnly cookie |
| `generalLimiter` | Rate-limit all API calls |
| `authMiddleware` | Verify JWT, attach `req.user` |
| `roleMiddleware` | Authorize by role |
| `validateMiddleware` | Run express-validator chains |
| `uploadMiddleware` | Multer (memory) for image uploads |
| `errorHandler` | Convert `ApiError` → structured JSON |

### 4.3 Error Handling

All async handlers are wrapped in `asyncHandler`:

```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

Services throw `ApiError(statusCode, message)`. The global error middleware catches everything and responds with:

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [...]
}
```

---

## 5. Authentication & Security

### 5.1 JWT Flow

```
POST /api/auth/login
  └─ validate credentials
  └─ generateToken({ id, role, tokenVersion })
  └─ res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'None' })
  └─ return user public JSON

Every authenticated request:
  └─ authMiddleware reads req.cookies.token
  └─ verify JWT signature + expiry
  └─ compare payload.tokenVersion with user.tokenVersion in DB
  └─ attach user to req.user
```

### 5.2 Token Versioning (Logout-Invalidation)

When a user logs out or changes their password, `tokenVersion` increments. Any outstanding JWT with the old `tokenVersion` is rejected — effectively invalidating all sessions without a token blacklist or Redis.

### 5.3 Security Matrix

| Threat | Mitigation |
|--------|-----------|
| XSS | JWT in httpOnly cookie, not localStorage |
| CSRF | `sameSite: 'None'` + CORS origin whitelist |
| Brute force | Rate limiting on `/auth/login` and `/auth/register` |
| Password exposure | bcrypt (10 rounds), `select: false` on schema |
| Privilege escalation | Role-based middleware on every admin route |
| File upload abuse | Multer type filter + Cloudinary validation |
| Mass assignment | Destructured body in controllers, not `...req.body` on models |

---

## 6. Payment System (Simulated Gateway)

The payment flow is designed to be **portfolio-safe** but **production-shaped**:

### 6.1 Flow

```
Client: user selects dates + payment method → POST /api/bookings/initiate-payment
Server:
  1. Validate input (propertyId, dates, paymentMethod)
  2. Fetch property, verify it's active
  3. Check date availability (server-side, not trusted from client)
  4. Calculate: subtotal = nights × pricePerNight
  5. Calculate: tax = subtotal × 18% (GST)
  6. Call paymentService.processPayment(total, method)
     → returns { success, transactionId }
  7a. SUCCESS:
       - Create Booking (status: confirmed, paymentStatus: paid)
       - Add to property.blockedDates
       - Create Notification for host
       - Return booking + transactionId
  7b. FAILURE:
       - Return 402 Payment Required
       - No booking created, no dates blocked
Client:
  - SUCCESS → show confirmation screen with transactionId
  - FAILURE → show retry prompt
```

### 6.2 Isolation Principle

`paymentService.js` is the **only file to replace** when integrating Razorpay/Stripe. The return contract is:

```js
{ success: boolean, transactionId: string | null }
```

Everything else in the booking flow remains unchanged.

### 6.3 Transaction ID Format

Two formats used for visual variety:
- `PAY_XXXXXXXX` — 8 random alphanumeric chars
- `TXN_YYYYMMDD_XXXXXX` — date-stamped with 6 random chars

---

## 7. Image Management

```
Client selects file(s)
  │
  ▼
POST /api/auth/avatar  OR  POST /api/properties/upload-images
  │
Multer (memory storage — no disk I/O)
  │
cloudinaryService.uploadSingleImage / uploadImages
  │
Cloudinary SDK → returns secure URL
  │
URL stored in User.avatar  OR  Property.images[]
```

**Why Cloudinary?**
- CDN delivery with automatic image optimization
- No static file serving burden on the Express server
- Folder organization: `nivana/avatars/`, `nivana/properties/`

---

## 8. Frontend Architecture

### 8.1 State Management

| State | Location |
|-------|---------|
| Authenticated user | `AuthContext` (React Context) |
| Page/list data | Local component `useState` + `useEffect` |
| Navigation | React Router v6 |

No Redux, Zustand, or Recoil — the app's complexity doesn't warrant it.

### 8.2 API Communication

All API calls go through a single `api()` utility that:
- Sets `credentials: 'include'` (sends cookies)
- Detects `FormData` vs JSON body and sets headers accordingly
- Throws an `ApiError` on non-2xx responses for consistent error handling

### 8.3 Route Protection

```jsx
<ProtectedRoute>        // requires authentication
<ProtectedRoute adminOnly>  // requires admin role
```

`ProtectedRoute` reads from `AuthContext`. Unauthenticated users are redirected to `/login`.

### 8.4 Layout System

| Layout | Used for |
|--------|---------|
| `MainLayout` | Public + user pages (header + footer) |
| `AuthLayout` | Login / Register pages (centered card) |
| `AdminLayout` | Admin pages (sidebar navigation) |

---

## 9. Popular Regions — Dynamic Count

The home page "Popular Regions" section shows live stay counts fetched from:

```
GET /api/properties/region-counts
```

This endpoint runs a MongoDB aggregation:
```js
Property.aggregate([
  { $group: { _id: { $toLower: '$state' }, count: { $sum: 1 } } }
])
```

The result is merged client-side with the static `POPULAR_DESTINATIONS` array (which holds the curated images and taglines). Regions with 0 properties are **hidden** automatically.

---

## 10. Notification System

When a booking is confirmed via the payment flow:

1. `notificationService.createBookingNotification(booking, property, transactionId)` is called
2. A `Notification` document is created with `recipientId = property.ownerId`
3. The host can fetch notifications via `GET /api/notifications`
4. Notifications can be marked read individually or in bulk

This is a **pull-based** notification system (polling / on-demand). Push notifications (WebSocket / Firebase) can be layered on top later.

---

## 11. Scalability Considerations

| Concern | Current Approach | Future Path |
|---------|-----------------|-------------|
| DB queries | Mongoose + compound indexes | Read replicas, caching (Redis) |
| Image delivery | Cloudinary CDN | Already scalable |
| Auth sessions | Stateless JWT | Add refresh token rotation |
| Rate limiting | In-process (express-rate-limit) | Redis-backed rate limiting |
| Background jobs | Synchronous in request | Bull queue + worker process |
| Payments | Simulated service | Replace `paymentService.js` only |
| Search | MongoDB text index | Elasticsearch / Atlas Search |

---

## 12. Deployment Architecture

```
                ┌─────────────────┐
     Browser ──▶│  Vercel (CDN)   │  React SPA
                │  client build   │
                └────────┬────────┘
                         │ /api/* → env VITE_API_URL
                         ▼
                ┌─────────────────┐
                │  Render.com     │  Express server
                │  (Node.js)      │  Always-on or free tier
                └────────┬────────┘
                         │
               ┌─────────┴──────────┐
               ▼                    ▼
        MongoDB Atlas           Cloudinary
        (cloud DB)             (image CDN)
```

**CORS:** Server whitelists the Vercel domain explicitly. Cookies use `sameSite: 'None'` + `secure: true` for cross-origin cookie transmission.

---

## 13. Design System

### Brand Identity

Nivana feels like **discovering a hidden retreat**, not booking a hotel room.

| Token | Value |
|-------|-------|
| Forest Green | `#2f5d50` |
| Sage Green | `#6f8f7f` (also `#9caf88`) |
| Warm Beige | `#f4efe7` |
| Cream White | `#faf8f4` |
| Primary Text | `#2b2b2b` |
| Border | `#e7dfd3` |

### Typography

- **Headings:** Playfair Display (editorial, premium)
- **Body:** Poppins (clean, readable)

### Design Principles

- Editorial layouts with generous whitespace
- Large destination photography
- Soft shadows, rounded corners
- Smooth hover transitions, micro-animations
- Mobile-first responsive design
- No dark luxury themes, no excessive gradients, no glassmorphism

### UI Inspiration

Aman Resorts · Six Senses · CGH Earth · Postcard Hotels

---

## 14. Key Engineering Decisions

| Decision | Rationale |
|----------|-----------|
| httpOnly cookies over localStorage | XSS protection — no JS access to token |
| Token versioning over blacklist | Stateless invalidation without Redis |
| Service layer between controller and model | Testable business logic, thin controllers |
| Denormalized rating + review count | Avoids aggregation on every list request |
| blockedDates embedded in Property | Single document read for availability check |
| paymentService.js isolated | Single swap point for real gateway integration |
| MongoDB text index for search | Sufficient for current scale; Atlas Search later |
| Simulated payment (~90% success) | Demonstrates full flow without real credentials |
| `ownerId` filter on public property listing | Enables host "My Properties" view without a separate endpoint |
